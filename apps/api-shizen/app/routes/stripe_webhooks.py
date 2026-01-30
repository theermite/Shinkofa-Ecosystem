"""
Stripe Webhooks Router
Shinkofa Platform - Shizen-Planner Service
Handles Stripe webhook events for subscriptions and payments
"""
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import stripe
import logging
from app.core.config import settings
from app.services.stripe_service import StripeService

# Setup logging
logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(
    prefix="/webhooks",
    tags=["webhooks"],
)

stripe_service = StripeService()


@router.post("/stripe")
async def stripe_webhook(request: Request):
    """
    Stripe webhook endpoint
    Handles all Stripe events (subscriptions, payments, etc.)

    IMPORTANT: Cette route doit être accessible publiquement (pas d'auth required)
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=webhook_secret
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    event_type = event["type"]
    event_data = event["data"]["object"]

    logger.info(f"Received Stripe webhook: {event_type}")

    try:
        # Checkout Session Completed (création abonnement ou achat one-time)
        if event_type == "checkout.session.completed":
            await stripe_service.handle_checkout_completed(event_data)

        # Subscription Created
        elif event_type == "customer.subscription.created":
            await stripe_service.handle_subscription_created(event_data)

        # Subscription Updated (changement plan, renouvellement, etc.)
        elif event_type == "customer.subscription.updated":
            await stripe_service.handle_subscription_updated(event_data)

        # Subscription Deleted (annulation)
        elif event_type == "customer.subscription.deleted":
            await stripe_service.handle_subscription_deleted(event_data)

        # Invoice Payment Succeeded (paiement réussi)
        elif event_type == "invoice.payment_succeeded":
            await stripe_service.handle_invoice_payment_succeeded(event_data)

        # Invoice Payment Failed (paiement échoué)
        elif event_type == "invoice.payment_failed":
            await stripe_service.handle_invoice_payment_failed(event_data)

        # Payment Intent Succeeded (one-time payment comme Manuel Holistique)
        elif event_type == "payment_intent.succeeded":
            await stripe_service.handle_payment_intent_succeeded(event_data)

        else:
            logger.info(f"Unhandled event type: {event_type}")

    except Exception as e:
        logger.error(f"Error handling webhook {event_type}: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")

    return JSONResponse(content={"status": "success"}, status_code=200)


@router.get("/stripe/health")
async def webhook_health():
    """
    Health check pour le webhook endpoint
    """
    return {
        "status": "healthy",
        "webhook_endpoint": "/api/webhooks/stripe",
        "stripe_configured": bool(settings.STRIPE_SECRET_KEY and settings.STRIPE_WEBHOOK_SECRET)
    }
