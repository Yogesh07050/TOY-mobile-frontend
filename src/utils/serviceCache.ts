import type { QueryClient } from '@tanstack/react-query';
import type { Service } from '../types';

const SERVICE_QUERY_ROOTS = ['services', 'savedServices', 'service'];

function patchService(service: Service, serviceId: number, patch: Partial<Service>): Service {
  return service.id === serviceId ? { ...service, ...patch } : service;
}

/** Patches every cached copy of a service (list pages and the detail query) so a save toggle reflects everywhere instantly. */
export function patchServiceInCache(queryClient: QueryClient, serviceId: number, patch: Partial<Service>) {
  for (const root of SERVICE_QUERY_ROOTS) {
    queryClient.setQueriesData({ queryKey: [root] }, (data: unknown) => {
      if (!data) return data;

      // Single service detail query.
      if (typeof data === 'object' && data !== null && 'id' in data && (data as Service).id === serviceId) {
        return { ...(data as Service), ...patch };
      }

      // Plain array (discovery rails).
      if (Array.isArray(data)) {
        return data.map((item) => (item?.id === serviceId ? patchService(item as Service, serviceId, patch) : item));
      }

      // Infinite query shape: { pages: [{ services, meta }], pageParams }
      if (typeof data === 'object' && data !== null && 'pages' in data) {
        const infinite = data as { pages: Array<{ services: Service[]; meta: unknown }>; pageParams: unknown[] };
        return {
          ...infinite,
          pages: infinite.pages.map((page) => ({
            ...page,
            services: page.services?.map((service) => patchService(service, serviceId, patch)) ?? page.services,
          })),
        };
      }

      return data;
    });
  }
}
