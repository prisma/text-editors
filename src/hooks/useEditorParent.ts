import { useEffect, useState } from "react";

export function useEditorParent(domSelector: string) {
  const [parent, setParent] = useState<Element>();
  const [dimensions, setDimensions] = useState<DOMRect>();

  useEffect(() => {
    const parent = document.querySelector(domSelector)!;
    setParent(parent);
    while (parent && parent.firstChild) parent.removeChild(parent.firstChild); // Empty out parent
    setDimensions(parent.getBoundingClientRect());
  }, []);

  return { parent, dimensions };
}
