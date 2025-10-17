"""
Serviço de Cache Simples em Memória
Cacheia resultados de chamadas pesadas por alguns minutos
"""

from datetime import datetime, timedelta
from typing import Any, Optional, Dict
import threading

class CacheService:
    """Cache simples em memória com TTL"""
    
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
    
    def get(self, key: str) -> Optional[Any]:
        """Busca valor do cache"""
        with self._lock:
            if key in self._cache:
                entry = self._cache[key]
                if datetime.now() < entry['expires_at']:
                    return entry['value']
                else:
                    # Expirou, remove
                    del self._cache[key]
            return None
    
    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        """Salva valor no cache com TTL (padrão 5 minutos)"""
        with self._lock:
            self._cache[key] = {
                'value': value,
                'expires_at': datetime.now() + timedelta(seconds=ttl_seconds)
            }
    
    def clear(self, pattern: Optional[str] = None):
        """Limpa cache (total ou por padrão)"""
        with self._lock:
            if pattern:
                keys_to_delete = [k for k in self._cache.keys() if pattern in k]
                for key in keys_to_delete:
                    del self._cache[key]
            else:
                self._cache.clear()
    
    def cleanup_expired(self):
        """Remove entradas expiradas"""
        with self._lock:
            now = datetime.now()
            keys_to_delete = [
                key for key, entry in self._cache.items()
                if now >= entry['expires_at']
            ]
            for key in keys_to_delete:
                del self._cache[key]


# Instância global
cache_service = CacheService()

