from sqlalchemy import select
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models import (
    User, DeveloperProfile, Skill, Technology, CommunityChannel, CompanySettings
)

async def seed_data():
    async with engine.begin() as conn:
        # Create all tables (including newly added CompanySettings, ActivityLog, etc.)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Ensure Core Skills & Technologies exist
        existing_skill = (await db.execute(select(Skill).limit(1))).scalar_one_or_none()
        if not existing_skill:
            skill_names = [
                "Python", "FastAPI", "React", "TypeScript", "SQL", "PostgreSQL",
                "AI/ML", "TensorFlow", "PyTorch", "Docker", "Kubernetes", "Node.js",
                "Tailwind CSS", "Next.js", "Redis", "GraphQL", "AWS", "Flutter",
                "Django", "System Design", "DevOps", "Microservices", "UI/UX Design"
            ]
            for s_name in skill_names:
                skill = Skill(name=s_name, category="Engineering")
                db.add(skill)

            for t_name in skill_names:
                tech = Technology(name=t_name)
                db.add(tech)

            await db.flush()

        # 2. Seed Channels (from Step 26)
        channels_data = [
            ("general", "General discussions, welcome hub, and company news", False),
            ("announcements", "Official announcements & platform releases", False),
            ("development", "Core engineering, architecture, and coding discussions", False),
            ("frontend", "React, TypeScript, UI/UX, styling, and web engineering", False),
            ("backend", "FastAPI, Python, microservices, databases, and APIs", False),
            ("ai-ml", "Autonomous intelligence, LLM pipelines, and machine learning", False),
            ("ui-ux", "Design systems, usability, Figma, and human-computer interaction", False),
            ("devops", "Cloud infrastructure, Kubernetes, CI/CD, and reliability", False),
            ("projects", "Collaboration, project planning, and delivery milestones", False),
        ]
        for name, desc, is_locked in channels_data:
            existing_ch = (await db.execute(select(CommunityChannel).where(CommunityChannel.name == name))).scalar_one_or_none()
            if not existing_ch:
                db.add(CommunityChannel(name=name, description=desc, is_locked=is_locked))
        await db.flush()

        # 3. Ensure Default CompanySettings exist
        existing_settings = (await db.execute(select(CompanySettings).where(CompanySettings.id == 1))).scalar_one_or_none()
        if not existing_settings:
            company_settings = CompanySettings(
                id=1,
                company_name="RMVS Web Services",
                logo_url="/logo.png",
                favicon_url="/favicon.png",
                tagline="DESIGN • DEVELOP • GROW TOGETHER",
                description="Enterprise web architecture, digital platforms, and elite engineering solutions.",
                primary_color="#0066FF",
                secondary_color="#00F2FE",
                email="contact@rmvswebservices.com",
                phone="+91 9400900000",
                whatsapp="+91 9400900000",
                website="https://rmvswebservices.com",
                footer_copyright="© 2026 RMVS Web Services. All rights reserved."
            )
            db.add(company_settings)
            await db.flush()
        else:
            existing_settings.company_name = "RMVS Web Services"
            existing_settings.logo_url = "/logo.png"
            existing_settings.favicon_url = "/favicon.png"
            existing_settings.tagline = "DESIGN • DEVELOP • GROW TOGETHER"
            existing_settings.footer_copyright = "© 2026 RMVS Web Services. All rights reserved."
            existing_settings.email = "contact@rmvswebservices.com"
            existing_settings.website = "https://rmvswebservices.com"

        # 4. Ensure CEO account exists
        admin_email = "riteshlingamallu8@gmail.com"
        existing_admin = (await db.execute(select(User).where(User.email == admin_email))).scalar_one_or_none()
        if not existing_admin:
            skills_res = await db.execute(select(Skill).where(Skill.name.in_(["Python", "FastAPI", "React", "TypeScript", "SQL", "PostgreSQL", "AI/ML", "Docker"])))
            admin_skills = list(skills_res.scalars().all())

            admin_user = User(
                email=admin_email,
                username="riteshlingamallu8",
                full_name="Ritesh Lingamallu",
                phone="+91 9400900000",
                hashed_password=get_password_hash("Ritesh@94009"),
                role="super_admin",
                status="approved",
                is_active=True,
                is_verified=True,
                avatar_url=None
            )
            db.add(admin_user)
            await db.flush()

            admin_profile = DeveloperProfile(
                user_id=admin_user.id,
                title="Chief Executive Officer (CEO)",
                department="Executive Leadership",
                short_bio="Executive Leadership & System Architecture.",
                bio="Leading full-lifecycle software engineering, platform architecture, and enterprise digital solutions.",
                location="India",
                availability="Available for Enterprise Advisory",
                years_experience=5,
                is_public=True,
                skills=admin_skills
            )
            db.add(admin_profile)
            await db.commit()
            print("CEO seeded successfully: riteshlingamallu8@gmail.com")
        else:
            await db.commit()
            print("System schemas, channels, company settings, and CEO verified.")

        # 5. Ensure Default WhatsAppConfig exists
        from app.models.whatsapp import WhatsAppConfig, WhatsAppTemplate
        from app.services.whatsapp.templates import DEFAULT_TEMPLATES
        import json

        existing_wa_cfg = (await db.execute(select(WhatsAppConfig).where(WhatsAppConfig.id == 1))).scalar_one_or_none()
        if not existing_wa_cfg:
            wa_cfg = WhatsAppConfig(
                id=1,
                is_enabled=True,
                test_mode=True, # Simulation mode enabled by default for safe local & staging runs
                phone_number_id="105938472910482",
                waba_id="948372619401823",
                webhook_verify_token="rmvs_whatsapp_verify_token_2026",
                business_phone_number="+919400900000",
                business_name="RMVS WebServices",
                default_language="en_US",
                max_retries=3,
                retry_delay_seconds=60,
                delivery_eta_threshold_minutes=30
            )
            db.add(wa_cfg)
            await db.flush()

        # 6. Ensure WhatsApp Templates exist
        for tmpl_data in DEFAULT_TEMPLATES:
            t_name = tmpl_data["template_name"]
            existing_tmpl = (await db.execute(select(WhatsAppTemplate).where(WhatsAppTemplate.template_name == t_name))).scalar_one_or_none()
            if not existing_tmpl:
                new_t = WhatsAppTemplate(
                    template_name=t_name,
                    display_name=tmpl_data["display_name"],
                    category=tmpl_data["category"],
                    language=tmpl_data["language"],
                    event_trigger=tmpl_data["event_trigger"],
                    header_text=tmpl_data.get("header_text"),
                    body_text=tmpl_data["body_text"],
                    footer_text="RMVS WebServices • Automated Update",
                    variables=json.dumps(tmpl_data["variables"]),
                    approval_status=tmpl_data["approval_status"],
                    is_active=True
                )
                db.add(new_t)
        await db.commit()

        # 7. Seed Sample Orders, Invoices, Deliveries if empty
        from app.models.orders import Order, Invoice, Delivery
        from datetime import datetime, timezone, timedelta

        existing_order = (await db.execute(select(Order).limit(1))).scalar_one_or_none()
        if not existing_order:
            now = datetime.now(timezone.utc)
            sample_orders = [
                {
                    "order_number": "RMVS-ORD-1001",
                    "customer_name": "Alexander Vance",
                    "customer_email": "alex.vance@blackmesa.tech",
                    "customer_phone": "+919876543210",
                    "service_type": "Enterprise AI Pipeline & Cloud Infrastructure",
                    "total_amount": 145000.0,
                    "status": "processing",
                    "delivery_eta": now + timedelta(days=5),
                    "notes": "Custom LLM fine-tuning and deployment on GCP Kubernetes."
                },
                {
                    "order_number": "RMVS-ORD-1002",
                    "customer_name": "Priya Sharma",
                    "customer_email": "priya.sharma@fintechgrowth.io",
                    "customer_phone": "+919123456789",
                    "service_type": "Full-Stack Web Application & Client Portal",
                    "total_amount": 89000.0,
                    "status": "dispatched",
                    "delivery_eta": now + timedelta(days=1),
                    "notes": "Modern React 18, FastAPI, PostgreSQL, and Stripe integration."
                },
                {
                    "order_number": "RMVS-ORD-1003",
                    "customer_name": "Marcus Aurelius",
                    "customer_email": "marcus@meditations.org",
                    "customer_phone": "+919811223344",
                    "service_type": "Mobile App Engineering (Flutter & Firebase)",
                    "total_amount": 120000.0,
                    "status": "delivered",
                    "delivery_eta": now - timedelta(days=2),
                    "notes": "Cross-platform mobile application with real-time sync."
                }
            ]

            for i, ord_info in enumerate(sample_orders, start=1):
                ord_obj = Order(
                    order_number=ord_info["order_number"],
                    customer_name=ord_info["customer_name"],
                    customer_email=ord_info["customer_email"],
                    customer_phone=ord_info["customer_phone"],
                    service_type=ord_info["service_type"],
                    total_amount=ord_info["total_amount"],
                    currency="INR",
                    status=ord_info["status"],
                    delivery_eta=ord_info["delivery_eta"],
                    notes=ord_info["notes"]
                )
                db.add(ord_obj)
                await db.flush()

                # Sample Invoice
                inv_obj = Invoice(
                    invoice_number=f"RMVS-INV-2026-00{i}",
                    order_id=ord_obj.id,
                    amount=ord_obj.total_amount,
                    currency="INR",
                    status="paid" if ord_info["status"] == "delivered" else "payment_pending",
                    due_date=now + timedelta(days=7),
                    invoice_url=f"/invoices/RMVS-INV-2026-00{i}",
                    payment_url=f"/pay/RMVS-INV-2026-00{i}"
                )
                db.add(inv_obj)

                # Sample Delivery
                del_obj = Delivery(
                    order_id=ord_obj.id,
                    tracking_number=f"RMVS-TRK-78901{i}",
                    delivery_agent_name="Vikram Sethi",
                    delivery_agent_phone="+919876500001",
                    status="delivered" if ord_info["status"] == "delivered" else ("in_transit" if ord_info["status"] == "dispatched" else "assigned"),
                    estimated_delivery=ord_info["delivery_eta"],
                    tracking_url=f"/track/RMVS-TRK-78901{i}",
                    destination_address="Cyber City, Block 4, Hyderabad, Telangana"
                )
                db.add(del_obj)

            await db.commit()
            print("WhatsApp automation configuration, templates, and sample orders seeded.")
