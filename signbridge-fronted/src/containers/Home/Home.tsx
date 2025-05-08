import { useState, useEffect } from "react";
import style from "./Home.module.css";
import { useTranslation } from "react-i18next";
// @ts-ignore
import { Link } from "react-router-dom";
import EditDialog from "./EditDialog";
import { GetComponent, GetImageSlider } from "@root/services/edithomepage.service";

import { useUserStore } from "@root/store/userStore";
import { useHomepageStore } from "@root/store/homepageStore";

import { motion } from "framer-motion";

type ImageModule = {
    image: string;
    sequence: number;
    status: string;
};

export default function HomepageSection() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const [currentSlide, setCurrentSlide] = useState(0);
    const [primaryColor, setPrimaryColor] = useState("#77828F");
    const [secondaryColor, setSecondaryColor] = useState("#B7C1CA");
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isImageSliderLoading, setIsImageSliderLoading] = useState(true);
    const [isComponentLoading, setIsComponentLoading] = useState(true);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const { user } = useUserStore();
    const { components, imageSlider, setImageSlider, setComponents } = useHomepageStore();

    // Fetch the image slider data from the database
    const fetchImgSliderData = async () => {
        try {
            const response = await GetImageSlider();
            if (response.status === 200) {
                setImageSlider(response.data.filter((slide: ImageModule) => slide.status === "Shown").sort((a: ImageModule, b: ImageModule) => a.sequence - b.sequence) as ImageModule[]);
                setIsImageSliderLoading(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchComponentData = async () => {
        try {
            const response = await GetComponent();
            if (response.status === 200) {
                setComponents(response.data);
                setIsComponentLoading(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchComponentData();
        fetchImgSliderData();
    }, []);

    useEffect(() => {
        setCurrentSlide(0);
    }, [imageSlider]);

    useEffect(() => {
        // Auto-play functionality
        let slideInterval: NodeJS.Timeout;

        if (isAutoPlaying) {
            slideInterval = setInterval(() => {
                setCurrentSlide((prevSlide) => 
                    prevSlide === imageSlider.length - 1 ? 0 : prevSlide + 1
                );
            }, 3000); // Change slide every 3 seconds
        }

        // Cleanup interval on component unmount or when auto-play is disabled
        return () => {
            if (slideInterval) {
                clearInterval(slideInterval);
            }
        };
    }, [isAutoPlaying, imageSlider.length]); // Dependencies

    // Optional: Pause auto-play when user interacts with dots
    const handleDotClick = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false); // Optionally pause auto-play when user manually changes slides
        
        // Optionally restart auto-play after a delay
        setTimeout(() => setIsAutoPlaying(true), 3000);
    };

    useEffect(() => {
        if (user) {
            if (user.role_access === "admin") {
                setPrimaryColor("#FFFFFF");
                setSecondaryColor("#A4825E");
            } else if (user.role_access === "signexpert") {
                setPrimaryColor("#FFFFFF");
                setSecondaryColor("#C6C6C6");
            } else {
                setPrimaryColor("#77828F");
                setSecondaryColor("#D3DEE8");
            }
        }
    }, [user]);

    useEffect(() => {
        if (!isComponentLoading && !isImageSliderLoading) {
            setLoading(false);
        }
    }, [isComponentLoading, isImageSliderLoading]);

    const handleScroll = () => {
        if (window.scrollY > 50) {
            setShowBackToTop(true);
        } else {
            setShowBackToTop(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {loading ? (
                <div className={style.loading}>
                    <div className={style.spinner}></div>
                </div>
            ) : (
                <div className={style.container}>
                    {/* Check the role_access is admin, then display this button */}
                    {user && user.role_access === "admin" && <EditDialog />}
                    {/* For the image slider */}
                    <div className={style.slider_container}>
                        {imageSlider.filter((slide) => slide.status === "Shown").length > 0 ? (
                            <div className={style.slider}>
                                {imageSlider.map((slide, index) => (
                                    <img 
                                        key={slide.sequence}
                                        src={slide.image as string} 
                                        alt={`Slide ${slide.sequence}`} 
                                        className={`${style.slider_image} ${index === currentSlide ? style.active : ''}`}
                                    />
                                ))}
                                <div className={style.dot_container}>
                                    {imageSlider.length > 0 &&
                                        imageSlider
                                            .filter((slide) => slide.status === "Shown")
                                            .sort((a, b) => a.sequence - b.sequence)
                                            .map((slide, index) => (
                                                <span 
                                                    key={slide.sequence} 
                                                    className={index === currentSlide ? `${style.dot} ${style.active}` : style.dot} 
                                                    onClick={() => handleDotClick(index)}
                                                />
                                            ))
                                    }
                                </div>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>

                    {/* For the available modules section */}
                    <section className={style.available_module_section} id="available_module_section">
                        <h1 className={style.heading} style={{ background: secondaryColor }}>
                            {lang === "en" ? (
                                <>
                                    <span style={{ color: primaryColor }}>{t("available")}</span> {t("module")}
                                </>
                            ) : (
                                <>
                                    <span style={{ color: primaryColor }}>{t("module")}</span> {t("available")}
                                </>
                            )}
                        </h1>
                        <div className={`${style.available_module_container}`}>
                            {components.length > 0 &&
                                components
                                    .filter((component) => component.type === "module")
                                    .map((component, index) => (
                                        <Link to={component.link} key={index} className={style.module_link}>
                                            <motion.div className={`${style.avail_module_box}`} initial={{ opacity: 0 }} transition={{ duration: 1, delay: index * 0.2 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.5 }}>
                                                <div className={style.avail_module_image} key={component.homepage_component_id}>
                                                    <img src={component.image as string} alt={lang === "en" ? component.title_en : component.title_bm} />
                                                    <div className={style.avail_module_text}>
                                                        <span className={style.cart_btn}>{lang === "en" ? component.title_en : component.title_bm}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                        </div>
                    </section>
                    
                    {/* New Deaf Mode Section */}
                    <motion.section
                        className={style.deaf_mode_section}
                        id="deaf_mode_section"
                        initial={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.25 }}
                    >
                        <h1 className={style.heading} style={{ background: secondaryColor }}>
                            {lang === "en" ? (
                                <>
                                    <span style={{ color: primaryColor }}>Deaf</span> Mode
                                </>
                            ) : (
                                <>
                                    <span style={{ color: primaryColor }}>Mod</span> Pekak
                                </>
                            )}
                        </h1>
                        <div className={`${style.deaf_mode_container}`}>
                            <Link to="/deaf-mode" className={style.module_link}>
                                <motion.div
                                    className={`${style.avail_module_box}`}
                                    initial={{ opacity: 0 }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                >
                                    <div className={style.avail_module_image}>
                                        <img src="/path/to/deaf-mode-icon.png" alt={lang === "en" ? "Deaf Mode" : "Mod Pekak"} />
                                        <div className={style.avail_module_text}>
                                            <span className={style.cart_btn}>
                                                {lang === "en" ? "Deaf Mode" : "Mod Pekak"}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.section>

                    {/* For the about section */}
                    <motion.section className={style.about} id="about" initial={{ opacity: 0 }} transition={{ duration: 1 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.25 }}>
                        <h1 className={`${style.heading}`} style={{ background: secondaryColor }}>
                            {t("about")} <span style={{ color: primaryColor }}>Neuon AI</span>
                        </h1>
                        {components.length > 0 &&
                            components
                                .filter((component) => component.type === "about")
                                .map((component, index) => (
                                    <div className={`${style.row}`} key={component.homepage_component_id}>
                                        <div className={style.video_container}>
                                            <img src={component.image as string} alt="Company" />
                                        </div>
                                        <div className={style.content}>
                                            <p>{lang === "en" ? component.description_en : component.description_bm}</p>
                                        </div>
                                    </div>
                                ))}
                    </motion.section>

                    {/* YouTube Section */}
                    <motion.section className={`${style.youtube_video}`} initial={{ opacity: 0 }} transition={{ duration: 1 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.25 }}>
                        <h1 className={style.heading} style={{ background: secondaryColor }} id="ytvideo">
                            <span style={{ color: primaryColor }}> YouTube </span> Video{" "}
                        </h1>
                        {components.length > 0 &&
                            components
                                .filter((component) => component.type === "youtube")
                                .map((component, index) => (
                                    <div key={index}>
                                        {component.link.includes("youtube.com") ? (
                                            <iframe key={component.homepage_component_id} src={component.link.replace("watch?v=", "embed/")} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
                                        ) : component.link.includes("vimeo.com") ? (
                                            <iframe key={component.homepage_component_id} src={component.link.replace("vimeo.com", "player.vimeo.com/video")} title="Vimeo video player" allow="autoplay; fullscreen; picture-in-picture"></iframe>
                                        ) : (
                                            <p>Unsupported video type or link format</p>
                                        )}
                                    </div>
                                ))}{" "}
                    </motion.section>
                    
                    

                    {/* Location Section */}
                    <motion.section className={`${style.location}`} initial={{ opacity: 0 }} transition={{ duration: 1 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.25 }}>
                        <h1 className={style.heading} style={{ background: secondaryColor }} id="gmap_canvas">
                            {t("location")}
                        </h1>
                        <div className={style.mapouter}>
                            <div className="gmap_canvas">{components.length > 0 && components.filter((component) => component.type === "location").map((component, index) => <iframe key={component.homepage_component_id} src={component.link}></iframe>)}</div>
                        </div>
                    </motion.section>

                    {/* Back to top button */}
                    {showBackToTop && (
                        <div className={style.back_to_top_button} onClick={scrollToTop}>
                            <i className="fa-solid fa-arrow-up"></i>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
