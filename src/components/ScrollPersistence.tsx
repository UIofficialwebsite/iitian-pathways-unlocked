import { useScrollPersistence } from '@/hooks/useScrollPersistence';

/**
 * Component that enables scroll position persistence across tab switches,
 * browser minimization, and page navigation.
 * 
 * Place this inside BrowserRouter to enable scroll persistence.
 */
const ScrollPersistence: React.FC = () => {
  useScrollPersistence();
  return null;
};

export default ScrollPersistence;
