import httpx
from fastapi import APIRouter, HTTPException, Query
from ..config import settings

router = APIRouter(prefix="/api", tags=["GitHub issues"])

@router.get("/issues")
async def search_issues(q: str = Query(default="good first issue", max_length=200),
                        language: str = Query(default="", max_length=50),
                        label: str = Query(default="", max_length=100),
                        per_page: int = Query(default=10, ge=1, le=30),
                        page: int = Query(default=1, ge=1, le=10)):
    parts = ["is:issue", "is:open"]
    if q.strip():
        parts.append(q.strip().replace("\\n", " ")[:150])
    if language:
        parts.append(f"language:{language.strip()}")
    if label:
        safe_label = label.replace('"', "")[:80]
        parts.append(f'label:"{safe_label}"')
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get("https://api.github.com/search/issues",
            params={"q": " ".join(parts), "per_page": per_page, "page": page, "sort": "updated", "order": "desc"},
            headers=headers)
    if response.status_code == 403:
        raise HTTPException(status_code=429, detail="GitHub rate limit reached. Try later or configure GITHUB_TOKEN.")
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="GitHub issue search failed.")
    data = response.json()
    issues = []
    for item in data.get("items", []):
        if "pull_request" in item:
            continue
        repo = item.get("repository_url", "").removeprefix("https://api.github.com/repos/")
        issues.append({"id": item.get("id"), "number": item.get("number"), "title": item.get("title"),
            "body": (item.get("body") or "")[:5000], "url": item.get("html_url"), "repository": repo,
            "state": item.get("state"), "labels": [x.get("name") for x in item.get("labels", [])],
            "comments": item.get("comments", 0), "updated_at": item.get("updated_at")})
    return {"total_count": data.get("total_count", 0), "issues": issues}
