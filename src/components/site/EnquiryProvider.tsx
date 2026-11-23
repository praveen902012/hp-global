"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { ProjectEnquiryModal, type Project } from "../ProjectEnquiryModal";

const EnquiryContext = createContext<(project?: Project) => void>(() => undefined);

/** Lets any component open the site-wide enquiry form. */
export function useEnquiry() {
  return useContext(EnquiryContext);
}

export function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const open = useCallback((value?: Project) => setProject(value ?? { title: "General enquiry", location: "" }), []);
  const close = useCallback(() => setProject(null), []);
  return (
    <EnquiryContext.Provider value={open}>
      {children}
      <ProjectEnquiryModal isOpen={!!project} project={project} onClose={close} />
    </EnquiryContext.Provider>
  );
}

/** A button that opens the enquiry form for a project. */
export function EnquireButton({ project, className, children }: { project?: Project; className: string; children: React.ReactNode }) {
  const open = useEnquiry();
  return <button type="button" className={className} onClick={() => open(project)}>{children}</button>;
}
