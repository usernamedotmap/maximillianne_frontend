

import { Button } from '@/components/ui/button';
import { ArrowRight, Ban, Calendar, Car, CheckCircle2, Clock, Sparkles, Tv, UtensilsCrossed, Volume2, Waves, Wifi, Wind } from 'lucide-react';
import Bedroom1 from "@/assets/images/bedroom1.jpg";
import Bedroom2 from "@/assets/images/bedroom2.jpg";
import Bedroom3 from "@/assets/images/bedroom3.jpg";
import Bathroom1 from "@/assets/images/bathroom1.jpg";
import Bathroom from "@/assets/images/bathroom.jpg";
import Livingroom1 from "@/assets/images/livingroom1.jpg";
import Livingroom2 from "@/assets/images/livingroom2.jpg";
import Livingroom3 from "@/assets/images/livingroom3.jpg";
import Livingroom4 from "@/assets/images/livingroom4.jpg";
import Kitchen from "@/assets/images/kitchen.jpg";
import Balcony from "@/assets/images/balcony.jpg";
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
    const navigate = useNavigate();

    const amenities = [
        {
            icon: Wifi,
            title: "Fast Wi-Fi",
            desc: "Ultra-fast fiber connection, ideal for remote work and high-definition streaming."
        },
        {
            icon: Wind,
            title: "Air Conditioning",
            desc: "Dual inverter units keeping the entire punit beautifully cool and comfortable"
        },
        {
            icon: UtensilsCrossed,
            title: "Full Kitchen",
            desc: "Equipped with electric stove, microwave, cookware, refrigerator, and coffee maker.",
        },
        {
            icon: Car,
            title: "Free Secure Parking",
            desc: "Dedicated covered slot withing building garage with round-the-clock security guards",
        },
        {
            icon: Tv,
            title: "Smart TV",
            desc: "55-inch 4K UHD smart display with Netflix, YouTube, and digital soundbar.",
        },
        {
            icon: Waves,
            title: "Swimming Pool",
            desc: "Direct access to our beautifully maintained condominium outdoor swimming pool."
        }
    ]

    const galleryImages = [
        {
            path: `${Livingroom4}`,
            title: "Warm Living Area",
            desc: "Spacious relaxation area with natural sunlight",
        },
        {
            path: `${Bedroom3}`,
            title: "Master Suite",
            desc: "Plush queen mattress with 400-thread count linens"
        },
        {
            path: `${Kitchen}`,
            title: "Gourmet Kitchen",
            desc: "Fully equipped for intimate home cooking"
        },
        {
            path: `${Bathroom}`,
            title: "Modern Bathroom",
            desc: "Hot shower with rainhead and organic toiletries",
        },
        {
            path: `${Balcony}`,
            title: "Balcony & City Skyline",
            desc: "Quiet evening city views and morning breeze"
        }
    ];


    return (
        <div className='flex flex-col gap-16 md:gap-24 pb-20'>
            {/* hero section */}
            <section className='pt-6 sm:pt-12'>
                <div className='container-page grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center'>
                    {/* left text */}
                    <div className='lg:col-span-7 space-y-6'>
                        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-xs font-semibold uppercase tracking-wider'>
                            <Sparkles className='w-3.5 h-3.5' />
                            <span>YOUR PRIVAVE SANCTUARY</span>
                        </div>

                        <h1 className='text-3xl sm:text-5xl lg:text-[3.25rem] font-serif font-bold text-foreground leading-[1.15] tracking-tight'>Your Private Staycation Escape</h1>
                        <p className='text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl'>
                            Relax, unwind, and enjoy a comfortable  staycation at Maximilliane's Haven, a hidden gem built for peaceful, exclusive relaxation in the city.
                        </p>

                        {/* cta */}
                        <div className='flex flex-wrap items-center gap-3 pt-2'>
                            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-sm px-6 shadow-md" size="lg" onClick={() => navigate("/availability")}>
                                <Calendar className='w-4 h-4 mr-2' />
                                Check Availability
                            </Button>
                            <Button variant="outline" size="lg" className="text-foreground hover:bg-muted font-medium text-sm px-6">Explore the Stay</Button>
                        </div>

                        {/* features */}
                        <div className='flex flex-wrap gap-4 sm:gap-6 pt-4 border-t border-border/80 text-xs text-muted-foreground font-medium'>
                            <span className='flex items-center gap-1.5'>
                                <CheckCircle2 className='w-4 h-4 text-primary' /> Comfortable Stay
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-primary" /> Great Location
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-primary" /> Easy GCash Booking
                            </span>
                        </div>
                    </div>

                    {/* right hero image */}
                    <div className='lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 relative'>
                        <div className='space-y-3 sm:space-y-4'>
                            <div className='rounded-2xl overflow-hidden shadow-md aspect-4/5 bg-muted'>
                                <img
                                    src={Bedroom2}
                                    alt='Cozy suite bedroom'
                                    className='w-full h-full object-cover hover:scale-105 transition-transform duration-500'
                                />
                            </div>
                            <div className='rounded-2xl overflow-hidden shadow-md aspect-4/5 bg-muted'>
                                <img
                                    src={Livingroom2}
                                    alt='Cozy suite bedroom'
                                    className='w-full h-full object-cover hover:scale-105 transition-transform duration-500'
                                />
                            </div>
                        </div>

                        <div className='space-y-3 sm:space-y-4 pt-6'>
                            <div className='rounded-2xl overflow-hidden shadow-sm aspect-video bg-muted'>
                                <img
                                    src={Bathroom1}
                                    alt='Luxury Bathroom'
                                    className='w-full h-full object-cover hover:scale-105 transition-transform duration-500'
                                />
                            </div>
                            <div className='rounded-2xl overflow-hidden shadow-sm aspect-4/5 bg-muted'>
                                <img
                                    src={Livingroom3}
                                    alt='Luxury Bathroom'
                                    className='w-full h-full object-cover hover:scale-105 transition-transform duration-500'
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* welcome sections */}
            <section id="stay-overview" className='scroll-mt-24'>
                <div className='container-page'>
                    <div className='bg-card border border-border rounded-2xl p-6 sm:p-10 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center'>
                        {/* left 2 iamges */}
                        <div className='lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4'>
                            <div className='rounded-xl overflow-hidden shadown-sm aspect-3/4 bg-muted'>
                                <img
                                    src={Bedroom1}
                                    alt="Warm bedroom interior"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className='rounded-xl overflow-hidden shadow-sm aspect-3/4 mt-6 bg-muted'>
                                <img
                                    src={Livingroom1}
                                    alt='Modern looks living room'
                                    className='w-full h-full object-cover'
                                />
                            </div>
                        </div>

                        {/* right text */}
                        <div className='lg:col-span-7 space-y-5'>
                            <h2 className='text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground'>
                                Welcome to Maximilliane's Haven
                            </h2>

                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Located in a serene and secure neighborhood, our boutique staycation condo is
                                designed for one relief: timber tranquility with modern comforts. We aim to offer
                                more than just a place to sleep—an oasis to recharge after busy days, or a quiet
                                basecamp to host your cozy weekend escapes with close loved ones.
                            </p>

                            <div className='space-y-3 pt-2'>
                                <div className='flex items-start gap-3'>
                                    <div className='w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt.0.5'>
                                        <CheckCircle2 className='w-3.5 h-3.5' />
                                    </div>
                                    <p className='text-xs sm:text-sm text-foreground/90'>
                                        Personally hosted with 24/7 digital concierge support
                                    </p>
                                </div>
                                <div className='flex items-start gap-3'>
                                    <div className='w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shink-0 mt-0.5'>
                                        <CheckCircle2 className='w-3.5 h-3.5' />
                                    </div>
                                    <p className="text-xs sm:text-sm text-foreground/90">Exclusive direct rates with zero hidden platform service fees</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-foreground/90">
                                        Access to building amenities including secure parking and swimming pool
                                    </p>
                                </div>
                            </div>

                            <div className='pt-2'>
                                <Button
                                    onClick={() => navigate("/availability")}
                                    className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs sm:text-sm px-5 py-2"
                                >
                                    Reserved Your Dates
                                    <ArrowRight className='w-4 h-4 ml-2' />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* phpto gallery */}
            <section id="photo-gallery" className='scroll-mt-24'>
                <div className='container-page space-y-6'>
                    <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-2'>
                        {/* <div>
                            <span className='eyebrow'>CURATED SPACES</span>
                        </div> */}
                        <h2 className='text-2xl sm:text-3xl font-serif font-bold text-foreground mt-1'>
                            Photo Gallery
                        </h2>
                        <p className='text-xs sm:text-sm text-muted-foreground'>
                            Click any photo to hightlight details
                        </p>
                    </div>

                    {/* feature larger viewer */}
                    <div className='relative rounded-2xl overflow-hidden shadow-md aspect-video sm:aspect-21/9 bg-muted border border-border'>
                        <img
                            src={galleryImages[activeGalleryIndex].path}
                            alt={galleryImages[activeGalleryIndex].title}
                            className='w-full h-full object-cover transition-all duration-300'
                        />
                        <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white'>
                            <span className='text-xs font-semibold uppercase tracking-wider text-white/80'>
                                Space {activeGalleryIndex + 1} of {galleryImages.length}
                            </span>
                            <h3 className='text-lg sm:text-2xl font-serif font-bold'>
                                {galleryImages[activeGalleryIndex].title}
                            </h3>
                            <p className="text-xs sm:text-sm text-white/80 max-w-lg mt-1">
                                {galleryImages[activeGalleryIndex].desc}
                            </p>
                        </div>
                    </div>

                    {/* thumbnail */}
                    <div className='grid grid-cols-5 gap-2 sm:gap-3'>
                        {galleryImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveGalleryIndex(idx)}
                                className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all cursor-pointer ${activeGalleryIndex === idx ? "border-primary ring-2 ring-primary/30 scale-[0.98]"
                                    : "border-transparent opacity-70 hover:opacity-100"}`}
                            >
                                <img
                                    src={img.path}
                                    alt={img.title}
                                    className='w-full h-full object-cover'
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </section>


            {/* ametnieti dito */}
            <section className='scroll-mt-24'>
                <div className='container-page space-y-8'>
                    <div className='text-center max-w-2xl mx-auto space-y-2'>
                        <span className='eyebrow'>DESIGNED FOR COMFORT & RECHARGE</span>
                        <h2 className='text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground'>
                            Thoughful Amenities
                        </h2>
                        <p className='text-xs sm:text-sm text-muted-foreground'>
                            Every you need for a restful, seamless stay in our private haven.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {amenities.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={idx} className='bg-card border border-border rounded-xl p-5 sm:p-6 shadown-sm hover:shadow-md transition-shadow space-y-3'>
                                    <div className='w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary'>
                                        <Icon className='w-5 h-5' />
                                    </div>
                                    <h3 className='text-base font-semibold text-foreground font-serif'>
                                        {item.title}
                                    </h3>
                                    <p className='text-xs sm:text-muted-foreground leading-relaxed'>
                                        {item.desc}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* pricing banner */}
            <section className='container-page'>
                <div className='bg-secondary/70 border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left'>
                    <div className='space-y-1'>
                        <span className='eyebrow text-primary font-bold'>EXCLUSIVE DIRECT RATE</span>
                        <div className='flex items-baseline gap-2 justify-center sm:justify-start'>
                            <span className='text-3xl sm:text-4xl font-bold font-serif text-foreground'>
                                ₱2,500
                            </span>
                            <span className='text-sm font-medium text-muted-foreground'>/ night</span>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            No hidden platform fees. Fixed rate with inclusive amenities.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate("/availability")}
                        size="lg"
                        className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-sm px-6 shadow-sm"
                    >
                        <Calendar className='w-4 h-4 mr-2' />
                        Check Availability
                    </Button>
                </div>
            </section>

            {/* house rules */}
            <section id="house-rules" className='scroll-mt-24'>
                <div className='container-page'>
                    <div className='bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm space-y-8'>
                        <div className='max-w-2xl space-y-2'>
                            <span className='eyebrow'>CONDO GUIDELINES</span>
                            <h2 className='text-2xl sm:text-3xl font-serif font-bold text-foreground'>
                                House Rules
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                We are dedicated to ensuring every guest enjoys a peaceful and pristine sanctuary.
                                Please review our house rules prior to requesting your reservation.
                            </p>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 border-t border-border pt-6 text-xs sm:text-sm">

                            {/* Check-in */}
                            <div className="grid grid-cols-[minmax(105px,auto)_1fr] items-center gap-3 py-3 border-b border-border/60">
                                <span className="text-muted-foreground font-medium flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary shrink-0" />
                                    Check-in
                                </span>
                                <span className="font-semibold text-foreground text-right">
                                    From 2:00 PM
                                </span>
                            </div>

                            {/* Check-out */}
                            <div className="grid grid-cols-[minmax(105px,auto)_1fr] items-center gap-3 py-3 border-b border-border/60">
                                <span className="text-muted-foreground font-medium flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary shrink-0" />
                                    Check-out
                                </span>
                                <span className="font-semibold text-foreground text-right">
                                    Before 12:00 PM
                                </span>
                            </div>

                            {/* Max Guests */}
                            <div className="grid grid-cols-[minmax(105px,auto)_1fr] items-center gap-3 py-3 border-b border-border/60">
                                <span className="text-muted-foreground font-medium flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                    Max Guests
                                </span>
                                <span className="font-semibold text-foreground text-right">
                                    6 guests maximum
                                </span>
                            </div>

                            {/* Smoking */}
                            <div className="grid grid-cols-[minmax(105px,auto)_1fr] items-center gap-3 py-3 border-b border-border/60">
                                <span className="text-muted-foreground font-medium flex items-center gap-2">
                                    <Ban className="w-4 h-4 text-destructive shrink-0" />
                                    Smoking
                                </span>
                                <span className="font-semibold text-foreground text-right">
                                    Strictly no smoking inside or on balcony
                                </span>
                            </div>

                            {/* Pets */}
                            <div className="grid grid-cols-[minmax(105px,auto)_1fr] items-center gap-3 py-3 border-b border-border/60">
                                <span className="text-muted-foreground font-medium flex items-center gap-2">
                                    <Ban className="w-4 h-4 text-destructive shrink-0" />
                                    Pets
                                </span>
                                <span className="font-semibold text-foreground text-right">
                                    No pets allowed on condo premises
                                </span>
                            </div>

                            {/* Quiet Hours */}
                            <div className="grid grid-cols-[minmax(105px,auto)_1fr] items-center gap-3 py-3 border-b border-border/60">
                                <span className="text-muted-foreground font-medium flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-primary shrink-0" />
                                    Quiet Hours
                                </span>
                                <span className="font-semibold text-foreground text-right">
                                    After 10:00 PM out of respect for neighbors
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* planning stay ctas. */}

            <section id="direct-booking" className='container-page'>
                <div className='bg-inverse text-inverse-foreground rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-lg border border-inverse-muted/20'>
                    <h2 className='text-2xl sm:text-3xl lg:text-4xl font-serif font-bold'>
                        Planning you stay?
                    </h2>
                    <p className='text-xs sm:text-sm text-inverse-muted max-w-xl mx-auto leading-relaxed'>Check availability calendar and lock in your preferred reservation dates before they fill
                        up.
                    </p>
                    <div className='pt-2'>
                        <Button
                        onClick={() => navigate("/availability")}
                        size="lg"
                        className="bg-card text-foreground hover:bg-white font-medium text-xs sm:text-sm px-6 py-2 shadow">
                            Check Availability
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
