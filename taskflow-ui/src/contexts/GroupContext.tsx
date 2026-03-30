import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { groupApi } from '../api/services';
import { useAuth } from './AuthContext';
import type { GroupDto } from '../types';

interface GroupContextType {
  groups: GroupDto[];
  isLoading: boolean;
  hasGroup: boolean;
  refreshGroups: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | null>(null);

export function GroupProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const refreshGroups = async () => {
    if (!isAuthenticated) {
      setGroups([]);
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await groupApi.getMyGroups();
      setGroups(response.data);
    } catch {
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshGroups();
  }, [isAuthenticated]);

  const hasGroup = groups.length > 0;

  return (
    <GroupContext.Provider value={{ groups, isLoading, hasGroup, refreshGroups }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within GroupProvider');
  }
  return context;
}
