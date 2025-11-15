import { NextRequest, NextResponse } from 'next/server';
import type { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js';
import { ethers } from 'ethers';

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload;
}

// In-memory storage for payment references (use database in production)
const paymentReferences = new Map();

export async function POST(req: NextRequest) {
  try {
    const { payload }: IRequestPayload = await req.json();
    
    console.log('Received payment confirmation:', payload);
    
    const { reference } = payload;
    
    // Retrieve payment data from storage
    const paymentData = paymentReferences.get(reference);
    
    if (paymentData) {
      console.log('Payment reference found:', paymentData);
      
      // Verify payment with World Developer Portal
      try {
        const appId = process.env.NEXT_PUBLIC_WLD_APP_ID!;
        const devPortalApiKey = process.env.DEV_PORTAL_API_KEY!;
        
        console.log('Verifying payment with World Developer Portal:', {
          reference,
          appId,
          hasApiKey: !!devPortalApiKey
        });
        
        const verifyResponse = await fetch(
          `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${appId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${devPortalApiKey}`,
            },
          }
        );
        
        console.log('World Developer Portal response status:', verifyResponse.status);
        
        if (!verifyResponse.ok) {
          const errorText = await verifyResponse.text();
          console.error('World Developer Portal API error:', {
            status: verifyResponse.status,
            statusText: verifyResponse.statusText,
            error: errorText
          });
          throw new Error(`World API error: ${verifyResponse.status} - ${errorText}`);
        }
        
        const transaction = await verifyResponse.json();
        console.log('World Developer Portal transaction data:', transaction);
        
        // 2. Here we optimistically confirm the transaction.
        // According to World Pay docs, we need to check the transaction reference matches our stored reference
        // and the transaction status is not failed
        if (transaction.reference === reference && transaction.status !== 'failed') {
          console.log('Payment verified successfully:', transaction);
          
          // Execute property purchase on-chain
          try {
            const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://worldchain-mainnet.g.alchemy.com/v2/your-api-key');
            const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
            
            // Import contract addresses and ABI
            const { CONTRACT_ADDRESSES } = await import('../../../lib/contract-utils');
            const { ECONOMYV2_ABI } = await import('../../../lib/economyv2-abi');
            
            const economyContract = new ethers.Contract(
               CONTRACT_ADDRESSES.ECONOMY,
               ECONOMYV2_ABI,
               wallet
             );
            
            // Call purchaseProperty function
            const tx = await economyContract.purchaseProperty(
              paymentData.userAddress,
              paymentData.propertyType,
              paymentData.propertyName,
              paymentData.location,
              paymentData.level || 1
            );
            
            console.log('Property purchase transaction sent:', tx.hash);
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Property purchase confirmed:', receipt);
            
            // Clean up payment reference
            paymentReferences.delete(reference);
            
            return NextResponse.json({ 
              success: true,
              transactionStatus: transaction.status,
              propertyTxHash: tx.hash
            });
          } catch (contractError) {
            console.error('Error executing property purchase:', contractError);
            return NextResponse.json({ 
              success: false,
              error: 'Property purchase failed'
            });
          }
        } else {
          console.error('Payment verification failed:', transaction);
          return NextResponse.json({ 
            success: false,
            error: 'Payment verification failed'
          });
        }
      } catch (verificationError) {
        console.error('Error verifying payment with World API:', verificationError);
        // Fall back to optimistic acceptance in case of API issues
        return NextResponse.json({ 
          success: true,
          message: 'Payment accepted (verification API unavailable)'
        });
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Reference mismatch' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}

// Helper function to store payment reference (called from initiate-payment)
export function storePaymentReference(id: string, data: any) {
  paymentReferences.set(id, data);
}
