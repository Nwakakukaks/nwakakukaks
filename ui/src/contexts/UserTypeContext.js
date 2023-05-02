import { createContext } from 'react';

const UserTypeContext = createContext({
  userRole: '',
  setUserRole: () => {},
});

export default UserTypeContext;