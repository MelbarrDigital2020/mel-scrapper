export function useContact() {
  return {
    contacts: [],
    loading: false,
    fetchContacts: () => {},
    filters: {},
    setFilters: () => {},
  };
}
