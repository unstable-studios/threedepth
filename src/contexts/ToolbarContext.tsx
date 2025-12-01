import { createContext, useContext, useState, ReactNode } from 'react';

interface ToolbarContextType {
	toolbarContent: ReactNode;
	setToolbarContent: (content: ReactNode) => void;
}

const ToolbarContext = createContext<ToolbarContextType | undefined>(undefined);

export function ToolbarProvider({ children }: { children: ReactNode }) {
	const [toolbarContent, setToolbarContent] = useState<ReactNode>(null);

	return (
		<ToolbarContext.Provider value={{ toolbarContent, setToolbarContent }}>
			{children}
		</ToolbarContext.Provider>
	);
}

export function useToolbar() {
	const context = useContext(ToolbarContext);
	if (!context) {
		throw new Error('useToolbar must be used within ToolbarProvider');
	}
	return context;
}
