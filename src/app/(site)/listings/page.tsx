import { permanentRedirect } from "next/navigation";

/** The old Listings page is replaced by Projects. */
export default function Page() {
  permanentRedirect("/projects");
}
