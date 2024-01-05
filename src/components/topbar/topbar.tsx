import { Feedback } from "../feedback";
import { AuthButton } from "./auth-button";
import { NotificationButton } from "./notification-button";

export const Topbar = () => {
  return (
    <>
      <div className="h-14 w-full border-b p-2 flex items-center justify-end gap-2">
        <Feedback />
        <NotificationButton />
        <AuthButton />
      </div>
    </>
  );
};
