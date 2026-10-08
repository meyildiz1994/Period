import { createContext, useContext } from 'react';

// Lets a control inside a page's ScrollView stop the page from scrolling while a finger is on it
// (the date wheel), so a drag on the wheel never moves the page instead.
export const ScrollLockContext = createContext<(locked: boolean) => void>(() => {});

export const useScrollLock = () => useContext(ScrollLockContext);
