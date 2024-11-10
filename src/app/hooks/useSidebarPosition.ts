export function useSidebarPosition(
  isSidebarOpen: boolean,
  isProfileSidebarOpen: boolean,
  isGraphViewOpen: boolean
) {
  const getPositionClasses = () => {
    const leftMargin = isSidebarOpen && isProfileSidebarOpen 
      ? 'ml-[266px]' 
      : isSidebarOpen || isProfileSidebarOpen 
        ? 'ml-[134px]' 
        : 'ml-0';

    const rightMargin = isGraphViewOpen ? 'mr-[300px]' : 'mr-0';

    return `${leftMargin} ${rightMargin}`;
  };

  return { getPositionClasses };
}
