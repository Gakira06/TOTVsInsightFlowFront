import { useState, useCallback } from "react";
import { clientService } from "../services/api";

export function useClient() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClient = useCallback(async (id) => {
    if (!id) {
      setClient(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getById(id);
      setClient(data);
    } catch (err) {
      setError(err.message || "Cliente não encontrado");
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { client, loading, error, fetchClient };
}
