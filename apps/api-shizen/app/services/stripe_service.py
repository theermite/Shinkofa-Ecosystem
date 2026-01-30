"""
Stripe Service
Shinkofa Platform - Shizen-Planner Service
Business logic for Stripe subscriptions and payments
"""
import stripe
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from app.core.config import settings

# Note: Ce service doit communiquer avec l'API Auth pour gérer les subscriptions
# Pour l'instant, on va créer la logique. L'intégration avec la DB viendra après.

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Service pour gérer les interactions avec Stripe"""

    # Mapping price_id → tier
    PRICE_TO_TIER = {
        # Mensuels
        settings.STRIPE_PRICE_SAMURAI_MONTHLY: ("samurai", "monthly"),
        settings.STRIPE_PRICE_SAMURAI_FAMILLE_MONTHLY: ("samurai_famille", "monthly"),
        settings.STRIPE_PRICE_SENSEI_MONTHLY: ("sensei", "monthly"),
        settings.STRIPE_PRICE_SENSEI_FAMILLE_MONTHLY: ("sensei_famille", "monthly"),
        # Annuels
        settings.STRIPE_PRICE_SAMURAI_YEARLY: ("samurai", "yearly"),
        settings.STRIPE_PRICE_SAMURAI_FAMILLE_YEARLY: ("samurai_famille", "yearly"),
        settings.STRIPE_PRICE_SENSEI_YEARLY: ("sensei", "yearly"),
        settings.STRIPE_PRICE_SENSEI_FAMILLE_YEARLY: ("sensei_famille", "yearly"),
    }

    def get_tier_from_price_id(self, price_id: str) -> tuple[str, str]:
        """
        Récupère le tier et l'interval depuis le price_id Stripe
        Returns: (tier, interval)
        """
        return self.PRICE_TO_TIER.get(price_id, ("musha", "monthly"))

    async def handle_checkout_completed(self, session: Dict[str, Any]):
        """
        Handle checkout.session.completed event
        Appelé quand un paiement est complété (abonnement ou one-time)
        """
        logger.info(f"Processing checkout.session.completed: {session['id']}")

        mode = session.get("mode")  # "subscription" ou "payment"
        customer_id = session.get("customer")
        client_reference_id = session.get("client_reference_id")  # user_id passé lors de la création

        if mode == "subscription":
            subscription_id = session.get("subscription")
            logger.info(f"New subscription created: {subscription_id} for customer: {customer_id}")

            # Récupérer la subscription Stripe pour avoir tous les détails
            subscription = stripe.Subscription.retrieve(subscription_id)

            # Le subscription.created event sera aussi déclenché, on le gère là-bas
            await self.handle_subscription_created(subscription)

        elif mode == "payment":
            # One-time payment (Manuel Holistique, etc.)
            payment_intent_id = session.get("payment_intent")
            logger.info(f"One-time payment completed: {payment_intent_id} for customer: {customer_id}")

            # On gère ça dans payment_intent.succeeded
            pass

    async def handle_subscription_created(self, subscription: Dict[str, Any]):
        """
        Handle customer.subscription.created event
        Créer ou mettre à jour la subscription dans notre DB
        """
        logger.info(f"Processing subscription.created: {subscription['id']}")

        subscription_id = subscription["id"]
        customer_id = subscription["customer"]
        status = subscription["status"]
        current_period_start = datetime.fromtimestamp(subscription["current_period_start"])
        current_period_end = datetime.fromtimestamp(subscription["current_period_end"])
        cancel_at_period_end = subscription["cancel_at_period_end"]

        # Récupérer le price_id depuis le premier item
        items = subscription.get("items", {}).get("data", [])
        if not items:
            logger.error(f"No items in subscription {subscription_id}")
            return

        price_id = items[0]["price"]["id"]
        amount = items[0]["price"]["unit_amount"] / 100  # Stripe stocke en centimes
        currency = items[0]["price"]["currency"]

        # Déterminer le tier et interval
        tier, interval = self.get_tier_from_price_id(price_id)

        logger.info(f"Subscription {subscription_id}: tier={tier}, interval={interval}, amount={amount}, status={status}")

        # TODO: Appeler l'API Auth pour créer/update la subscription dans la DB
        # Pour l'instant, on log juste
        logger.info(f"[TODO] Create subscription in DB: user with customer_id={customer_id}")

        """
        Structure à envoyer à l'API Auth:
        {
            "stripe_customer_id": customer_id,
            "stripe_subscription_id": subscription_id,
            "stripe_price_id": price_id,
            "tier": tier,
            "status": status,
            "interval": interval,
            "amount": amount,
            "currency": currency,
            "current_period_start": current_period_start.isoformat(),
            "current_period_end": current_period_end.isoformat(),
            "cancel_at_period_end": cancel_at_period_end,
        }
        """

    async def handle_subscription_updated(self, subscription: Dict[str, Any]):
        """
        Handle customer.subscription.updated event
        Mettre à jour la subscription (changement plan, renouvellement, annulation programmée, etc.)
        """
        logger.info(f"Processing subscription.updated: {subscription['id']}")

        subscription_id = subscription["id"]
        status = subscription["status"]
        cancel_at_period_end = subscription["cancel_at_period_end"]
        canceled_at = subscription.get("canceled_at")
        current_period_start = datetime.fromtimestamp(subscription["current_period_start"])
        current_period_end = datetime.fromtimestamp(subscription["current_period_end"])

        # Récupérer le price_id (peut avoir changé si upgrade/downgrade)
        items = subscription.get("items", {}).get("data", [])
        if items:
            price_id = items[0]["price"]["id"]
            amount = items[0]["price"]["unit_amount"] / 100
            tier, interval = self.get_tier_from_price_id(price_id)
        else:
            price_id = None
            amount = 0
            tier = "musha"
            interval = "monthly"

        logger.info(f"Subscription {subscription_id} updated: status={status}, tier={tier}, cancel_at_period_end={cancel_at_period_end}")

        # TODO: Appeler l'API Auth pour update la subscription dans la DB
        logger.info(f"[TODO] Update subscription in DB: {subscription_id}")

    async def handle_subscription_deleted(self, subscription: Dict[str, Any]):
        """
        Handle customer.subscription.deleted event
        Annuler/terminer la subscription (fin de période ou annulation immédiate)
        """
        logger.info(f"Processing subscription.deleted: {subscription['id']}")

        subscription_id = subscription["id"]
        ended_at = datetime.fromtimestamp(subscription.get("ended_at", subscription["current_period_end"]))

        logger.info(f"Subscription {subscription_id} ended at {ended_at}")

        # TODO: Mettre à jour status à "canceled" et ended_at dans la DB
        logger.info(f"[TODO] Cancel subscription in DB: {subscription_id}")

        """
        Update dans la DB:
        {
            "status": "canceled",
            "ended_at": ended_at.isoformat(),
        }
        Passer le user en tier "musha" (gratuit)
        """

    async def handle_invoice_payment_succeeded(self, invoice: Dict[str, Any]):
        """
        Handle invoice.payment_succeeded event
        Confirmer le paiement d'une facture (renouvellement abonnement)
        """
        logger.info(f"Processing invoice.payment_succeeded: {invoice['id']}")

        subscription_id = invoice.get("subscription")
        customer_id = invoice["customer"]
        amount_paid = invoice["amount_paid"] / 100
        currency = invoice["currency"]

        if subscription_id:
            logger.info(f"Subscription {subscription_id} renewed: {amount_paid} {currency}")
            # Le subscription.updated event sera aussi déclenché
        else:
            logger.info(f"One-time payment invoice: {invoice['id']}")

    async def handle_invoice_payment_failed(self, invoice: Dict[str, Any]):
        """
        Handle invoice.payment_failed event
        Gérer l'échec de paiement (mettre subscription en "past_due")
        """
        logger.info(f"Processing invoice.payment_failed: {invoice['id']}")

        subscription_id = invoice.get("subscription")
        customer_id = invoice["customer"]
        amount_due = invoice["amount_due"] / 100

        if subscription_id:
            logger.warning(f"Subscription {subscription_id} payment failed: {amount_due} EUR")

            # TODO: Update status à "past_due" dans la DB
            # TODO: Envoyer email au user pour mettre à jour moyen de paiement
            logger.info(f"[TODO] Mark subscription as past_due: {subscription_id}")

    async def handle_payment_intent_succeeded(self, payment_intent: Dict[str, Any]):
        """
        Handle payment_intent.succeeded event
        Gérer les one-time payments (Manuel Holistique, etc.)
        """
        logger.info(f"Processing payment_intent.succeeded: {payment_intent['id']}")

        payment_intent_id = payment_intent["id"]
        customer_id = payment_intent.get("customer")
        amount = payment_intent["amount"] / 100
        currency = payment_intent["currency"]
        metadata = payment_intent.get("metadata", {})

        product_type = metadata.get("product_type")  # "manuel_holistique"
        product_name = metadata.get("product_name")  # "Manuel Holistique Complet - Samurai"
        user_id = metadata.get("user_id")

        logger.info(f"One-time payment succeeded: {product_type} for user {user_id}: {amount} {currency}")

        # TODO: Créer un Purchase dans la DB
        logger.info(f"[TODO] Create purchase in DB: product_type={product_type}, user_id={user_id}")

        """
        Créer Purchase dans la DB:
        {
            "user_id": user_id,
            "stripe_payment_intent_id": payment_intent_id,
            "stripe_price_id": metadata.get("price_id"),
            "product_type": product_type,
            "product_name": product_name,
            "amount": amount,
            "currency": currency,
            "status": "succeeded",
            "metadata": metadata,
        }
        """
