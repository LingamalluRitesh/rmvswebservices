from sqlalchemy import select, text
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models import (
    User, DeveloperProfile, Skill, Technology, CommunityChannel, CompanySettings,
    Project, ProjectDeveloper
)

async def seed_data():
    async with engine.begin() as conn:
        # Create all tables (including newly added CompanySettings, ActivityLog, etc.)
        await conn.run_sync(Base.metadata.create_all)
        # Safe migration for ongoing project telemetry columns
        try:
            await conn.execute(text("ALTER TABLE projects ADD COLUMN progress_percentage INTEGER DEFAULT 0"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE projects ADD COLUMN current_stage VARCHAR(100) DEFAULT 'In Development'"))
        except Exception:
            pass

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

        # 8. Seed Real Projects with Verified Creators and Authentic Imagery
        existing_proj = (await db.execute(select(Project).limit(1))).scalar_one_or_none()
        if not existing_proj:
            # Find admin developer profile
            admin_prof_stmt = select(DeveloperProfile).join(User).where(User.email == admin_email)
            admin_prof = (await db.execute(admin_prof_stmt)).scalar_one_or_none()

            projects_to_seed = [
                {
                    "name": "SreeWaterSolutions",
                    "slug": "sreewatersolutions",
                    "short_description": "Professional water purification and commercial water treatment systems provider delivering reliable RO plants, water systems, and 24/7 maintenance.",
                    "description": "Engineered responsive corporate web platform and digital customer portal for Andhra Pradesh & Telangana's premier water purification provider. Features live maintenance request tracking, commercial reverse osmosis specifications, and industrial water quality testing calculators.",
                    "category": "Websites",
                    "client_name": "Sree Water Solutions",
                    "demo_url": "https://www.sreewatersolutions.com/",
                    "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
                    "status": "Published",
                    "visibility": "Public",
                    "techs": ["React", "TypeScript", "Tailwind CSS"]
                },
                {
                    "name": "Narasimha Stills",
                    "slug": "narasimha-stills",
                    "short_description": "Cinematic visual portfolio showcasing high-definition photography, wedding moments, drone cinematography, and event capturing with interactive gallery design.",
                    "description": "High-performance interactive 3D photography showcase featuring cinematic animations, ultra-fast image loading, dynamic photo filtering, and visual studio portfolio.",
                    "category": "Websites",
                    "client_name": "NS Photography",
                    "demo_url": "https://photography-website-ahc.pages.dev/",
                    "image_url": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
                    "status": "Published",
                    "visibility": "Public",
                    "techs": ["React", "TypeScript"]
                },
                {
                    "name": "PBR Solar Energy",
                    "slug": "pbr-solar-energy",
                    "short_description": "Modern, responsive solar-energy platform designed to showcase sustainable clean energy engineering and industrial installations.",
                    "description": "Engineered clean renewable solar platform with solar savings calculator, commercial rooftop installation estimators, and enterprise consultation booking.",
                    "category": "Websites",
                    "client_name": "PBR Solar Energy",
                    "demo_url": "https://www.pbrsolarenergy.com/",
                    "repo_url": "https://github.com/LingamalluRitesh/pbr-solar",
                    "image_url": "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
                    "status": "Published",
                    "visibility": "Public",
                    "techs": ["React", "TypeScript", "Tailwind CSS"]
                },
                {
                    "name": "RMVS Nexus Enterprise ERP",
                    "slug": "rmvs-nexus-erp",
                    "short_description": "High-throughput enterprise resource planning and microservices engine with asynchronous database pooling and granular RBAC.",
                    "description": "Distributed backend architecture supporting multi-tenant isolation, real-time telemetry streaming, role-based access control, and asynchronous job queues with sub-15ms response latency.",
                    "category": "Software",
                    "client_name": "RMVS Enterprise",
                    "demo_url": "https://rmvswebservices.onrender.com/",
                    "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
                    "status": "Published",
                    "visibility": "Public",
                    "techs": ["Python", "FastAPI", "PostgreSQL", "Docker", "Microservices"]
                },
                {
                    "name": "Aura Logistics Mobile App",
                    "slug": "aura-logistics-app",
                    "short_description": "Cross-platform mobile engineering for real-time fleet telemetry, GPS courier dispatch, and temperature-controlled cold chain tracking.",
                    "description": "High-reliability mobile application engineered with offline-first synchronization, biometric login, turn-by-turn route optimization, and live temperature alert push notifications.",
                    "category": "Mobile Apps",
                    "client_name": "Aura Freight Systems",
                    "demo_url": "https://rmvswebservices.onrender.com/track",
                    "image_url": "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1200&q=80",
                    "status": "Published",
                    "visibility": "Public",
                    "techs": ["Flutter", "AWS"]
                },
                {
                    "name": "Synapse AI & WhatsApp Platform",
                    "slug": "synapse-ai-automation",
                    "short_description": "Autonomous multi-agent orchestration and official Meta WhatsApp Cloud API v21.0 event dispatcher with live webhook analytics.",
                    "description": "Enterprise digital intelligence platform integrating custom LLM pipelines, real-time customer conversation routing, automated order milestone notifications, and proactive delivery ETA updates.",
                    "category": "Digital Solutions",
                    "client_name": "Global Commerce Group",
                    "demo_url": "https://rmvswebservices.onrender.com/ceo",
                    "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
                    "status": "Published",
                    "visibility": "Public",
                    "progress_percentage": 100,
                    "current_stage": "Production Live",
                    "techs": ["Python", "FastAPI", "AI/ML"]
                },
                {
                    "name": "Zenith TeleHealth & Clinical EHR Suite",
                    "slug": "zenith-telehealth-ehr",
                    "short_description": "HIPAA-compliant WebRTC telemedicine consultation portal with real-time biometric vitals monitoring and automated clinical patient scheduling.",
                    "description": "Currently in active development: High-security healthcare platform engineered with end-to-end encrypted video channels, live doctor-patient chat, digital prescription issuance, and direct electronic health records (EHR) synchronization.",
                    "category": "Websites",
                    "client_name": "Zenith Health Systems",
                    "demo_url": "https://rmvswebservices.onrender.com/projects/zenith-telehealth-ehr",
                    "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
                    "status": "Ongoing",
                    "visibility": "Public",
                    "progress_percentage": 65,
                    "current_stage": "Sprint 3: HIPAA WebRTC Video & EHR Integration",
                    "completion_date": "Dec 2026",
                    "techs": ["React", "TypeScript", "FastAPI", "WebRTC", "PostgreSQL"]
                },
                {
                    "name": "Apex Fleet Autonomous Telematics Hub",
                    "slug": "apex-fleet-telematics",
                    "short_description": "Edge IoT fleet telemetry streaming vehicle diagnostics, temperature sensors, automated route optimization, and driver performance telemetry.",
                    "description": "Currently in active development: High-throughput telemetry and cold-chain monitoring hub. Ingests MQTT streams from 5,000+ connected vehicle hardware sensors with sub-second latency, map geospatial routing, and emergency alert dispatches.",
                    "category": "Software",
                    "client_name": "Apex Global Logistics",
                    "demo_url": "https://rmvswebservices.onrender.com/projects/apex-fleet-telematics",
                    "image_url": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
                    "status": "Ongoing",
                    "visibility": "Public",
                    "progress_percentage": 80,
                    "current_stage": "Sprint 4: Edge IoT Sensor Telemetry & Map Routing",
                    "completion_date": "Jan 2027",
                    "techs": ["Python", "Docker", "Redis", "Kafka", "PostgreSQL"]
                }
            ]

            for p_info in projects_to_seed:
                # Techs
                tech_objs = []
                for t_name in p_info["techs"]:
                    t_stmt = select(Technology).where(Technology.name == t_name)
                    t_obj = (await db.execute(t_stmt)).scalar_one_or_none()
                    if not t_obj:
                        t_obj = Technology(name=t_name)
                        db.add(t_obj)
                        await db.flush()
                    tech_objs.append(t_obj)

                proj_obj = Project(
                    name=p_info["name"],
                    slug=p_info["slug"],
                    short_description=p_info["short_description"],
                    description=p_info["description"],
                    category=p_info["category"],
                    client_name=p_info["client_name"],
                    demo_url=p_info["demo_url"],
                    repo_url=p_info.get("repo_url"),
                    image_url=p_info["image_url"],
                    status=p_info["status"],
                    visibility=p_info["visibility"],
                    progress_percentage=p_info.get("progress_percentage", 100),
                    current_stage=p_info.get("current_stage", "Production Live"),
                    completion_date=p_info.get("completion_date"),
                    technologies=tech_objs
                )
                db.add(proj_obj)
                await db.flush()

                if admin_prof:
                    assoc = ProjectDeveloper(
                        project_id=proj_obj.id,
                        developer_id=admin_prof.id,
                        role_in_project="Lead Architect" if proj_obj.category in ["Software", "Digital Solutions"] else "Lead Developer",
                        is_lead=True
                    )
                    db.add(assoc)

            await db.commit()
            print("Real projects seeded with verified developer attribution and actual-fit photography.")
