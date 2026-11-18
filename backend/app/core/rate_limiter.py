import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from typing import Dict, Tuple
import threading

class InMemoryRateLimiter:
    def __init__(self):
        self._store: Dict[str, list] = defaultdict(list)
        self._lock = threading.Lock()
    
    def is_allowed(self, key: str, limit: int, window_seconds: int) -> Tuple[bool, int]:
        now = time.time()
        with self._lock:
            requests = self._store[key]
            # Clean old requests
            self._store[key] = [t for t in requests if now - t < window_seconds]
            
            if len(self._store[key]) >= limit:
                retry_after = int(window_seconds - (now - self._store[key][0]))
                return False, retry_after
            
            self._store[key].append(now)
            return True, 0

rate_limiter = InMemoryRateLimiter()

def rate_limit(limit: int = 60, window: int = 60, key_func=None):
    async def dependency(request: Request):
        if key_func:
            key = key_func(request)
        else:
            key = f"{request.client.host}:{request.url.path}"
        
        allowed, retry_after = rate_limiter.is_allowed(key, limit, window)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Retry after {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)},
            )
    return dependency

auth_rate_limit = rate_limit(limit=5, window=60)
scan_rate_limit = rate_limit(limit=10, window=60)
api_rate_limit = rate_limit(limit=100, window=60)
