"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditSimulationForm } from "@/components/forms/edit-simulation-form"

interface EditSimulationDialogProps {
	simulationId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditSimulationDialog({ simulationId, open, onOpenChange }: EditSimulationDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Editar Simulação</DialogTitle>
					<DialogDescription>Altere os dados da simulação. As alterações serão salvas ao final do processo.</DialogDescription>
				</DialogHeader>
				{/* A key garante que o componente e seu estado sejam resetados se o ID mudar */}
				{open && <EditSimulationForm key={simulationId} simulationId={simulationId} onFinished={() => onOpenChange(false)} />}
			</DialogContent>
		</Dialog>
	)
}
