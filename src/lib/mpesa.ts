export type MpesaInstructions = {
  success: boolean
  instructions: string
  reference: string
}

export type MpesaVerification = {
  status: 'pending' | 'paid' | 'failed'
}

export async function initiateMpesaPayment(order: {
  order_number: string
  total: number
}): Promise<MpesaInstructions> {
  return {
    success: true,
    instructions: `Envie ${order.total} MZN para o numero M-Pesa: +258 84 XXX XXXX`,
    reference: order.order_number,
  }
}

export async function verifyMpesaPayment(
  _transactionId: string,
): Promise<MpesaVerification> {
  return { status: 'pending' }
}
