import React, { useState, useEffect } from "react";
import styles from "./Faq.module.css";
import * as Accordion from "@radix-ui/react-accordion";
import classNames from "classnames";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { FetchFaq } from "../../services/faq.service";
import { useTranslation } from "react-i18next";

interface FaqData {
  question_en: string;
  question_bm: string;
  answer_en: string;
  answer_bm: string;
  faq_id: number;
}

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof Accordion.Trigger> {
  children: React.ReactNode;
  className?: string;
}

interface AccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof Accordion.Content> {
  children: React.ReactNode;
  className?: string;
}

export default function Faq() {
  const { t, i18n } = useTranslation();
  const [faqs, setFaqs] = useState<FaqData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const currentSelectedLanguage = localStorage.getItem("i18nextLng") || "en";

  const AccordionDemo = ({ faqs }: { faqs: FaqData[] }) => (
    <Accordion.Root
      className={styles.AccordionRoot}
      type="single"
      defaultValue={faqs[0]?.faq_id.toString()}
      collapsible
    >
      {faqs.map((faq) => (
        <Accordion.Item
          className={styles.AccordionItem}
          value={faq.faq_id.toString()}
          key={faq.faq_id}
        >
          <AccordionTrigger>
            {currentSelectedLanguage === "en"
              ? faq.question_en
              : faq.question_bm}
          </AccordionTrigger>
          <AccordionContent>
            {currentSelectedLanguage === "en" ? faq.answer_en : faq.answer_bm}
          </AccordionContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );

  const AccordionTrigger = React?.forwardRef<
    HTMLButtonElement,
    AccordionTriggerProps
  >(({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className={styles.AccordionHeader}>
      <Accordion.Trigger
        className={classNames(styles.AccordionTrigger, className)}
        {...props}
        ref={forwardedRef}
      >
        {children}
        <ChevronDownIcon className={styles.AccordionChevron} aria-hidden />
      </Accordion.Trigger>
    </Accordion.Header>
  ));

  const AccordionContent = React?.forwardRef<
    HTMLDivElement,
    AccordionContentProps
  >(({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={classNames(styles.AccordionContent, className)}
      {...props}
      ref={forwardedRef}
    >
      <div className={styles.AccordionContentText}>{children}</div>
    </Accordion.Content>
  ));

  useEffect(() => {
    const getFaqs = async () => {
      try {
        // Perform the API call and destructure the `data` property from the response
        const { data } = await FetchFaq();
        // Set the FAQ data state with the returned data
        setFaqs(data);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        // Set loading to false regardless of the result
        setLoading(false);
      }
    };

    getFaqs();
  }, []);

  // if (loading) {
  //   return (
  //     <div className="loading_wrapper">
  //       <div className="loading_circle"></div>
  //       <div className="loading_circle"></div>
  //       <div className="loading_circle"></div>
  //       <div className="loading_shadow"></div>
  //       <div className="loading_shadow"></div>
  //       <div className="loading_shadow"></div>
  //       <span>Loading</span>
  //     </div>
  //   );
  // }

  return (
    <div>
      <img
        src="./images/faq.png"
        alt="Frequently Asked Questions"
        className={styles.faqImage}
      />
      <AccordionDemo faqs={faqs} />
    </div>
  );
}
