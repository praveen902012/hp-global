import { AdminLogin } from "../../../views/Admin/Login";

export default function Page() {
  const developmentCredentials =
    process.env.NODE_ENV === "development"
      ? {
          email: process.env.ADMIN_EMAIL ?? "",
          password: process.env.ADMIN_PASSWORD ?? "",
        }
      : undefined;

  return <AdminLogin developmentCredentials={developmentCredentials} />;
}
