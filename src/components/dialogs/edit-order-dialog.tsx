"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditOrderForm } from "@/components/forms/edit-order-form"

interface EditOrderDialogProps {
	orderId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditOrderDialog({ orderId, open, onOpenChange }: EditOrderDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Editar Pedido</DialogTitle>
					<DialogDescription>Altere os dados do pedido. As alterações serão salvas ao final do processo.</DialogDescription>
				</DialogHeader>
				{/* A key garante que o componente e seu estado sejam resetados se o ID mudar */}
				{open && <EditOrderForm key={orderId} orderId={orderId} onFinished={() => onOpenChange(false)} />}
			</DialogContent>
		</Dialog>
	)
}
