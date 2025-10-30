import { NextRequest, NextResponse } from 'next/server';
import { storePaymentReference } from '../confirm-payment/route';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyType, paymentToken, amount, userAddress, propertyName, location, level } = body;
    
    // Generate unique reference ID
    const uuid = crypto.randomUUID().replace(/-/g, '');
    
    // Store the payment reference for later confirmation
    const paymentData = {
      id: uuid,
      propertyType,
      paymentToken,
      amount,
      userAddress,
      propertyName,
      location,
      level: level || 1,
      status: 'initiated',
      createdAt: new Date().toISOString()
    };
    
    storePaymentReference(uuid, paymentData);
    console.log('Payment initiated:', paymentData);
    
    return NextResponse.json({ 
      id: uuid,
      success: true 
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}