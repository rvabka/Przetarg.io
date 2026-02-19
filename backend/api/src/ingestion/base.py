from abc import ABC, abstractmethod

class BaseIngestionWorker(ABC):
    @abstractmethod
    async def run(self):
        """Executes the ingestion logic."""
        pass
