import { Navigate } from "react-router-dom";

// Redirect to the Landing page
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
