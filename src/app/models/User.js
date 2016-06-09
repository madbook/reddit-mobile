export const newUserModel = ({name, loggedOut=false, loading=true, features={}}) => {
  return ({ name, loggedOut, loading, features });
};
