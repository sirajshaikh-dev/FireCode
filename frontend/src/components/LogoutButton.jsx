import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "@/components/ui/button";

const LogoutButton = ({ children, variant = "default", size = "default", className }) => {
  const { logout } = useAuthStore();

  const onLogout = async () => {
    await logout();
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={onLogout}>
      {children}
    </Button>
  );
};

export default LogoutButton;