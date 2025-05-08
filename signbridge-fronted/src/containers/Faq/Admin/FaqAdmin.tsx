import React, { useState, useEffect } from "react";
import styles from "./FaqAdmin.module.css";
import * as Accordion from "@radix-ui/react-accordion";
import classNames from "classnames";
import { ChevronDownIcon, Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import {
  FetchFaq,
  CreateFaq,
  DeleteFaq,
  UpdateFaq,
} from "../../../services/faq.service";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import InputField from "../../../components/InputField/InputField";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getAuth } from "firebase/auth";

const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATION_API_KEY;
const API_URL = import.meta.env.VITE_GOOGLE_TRANSLATION_API_URL;
const translateText = async (text: string, targetLanguage: "ms" | "en") => {
  const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
    q: text,
    target: targetLanguage,
  });

  return response.data.data.translations[0].translatedText;
};

interface FaqData {
  question_en: string;
  answer_en: string;
  question_bm: string;
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

export default function FaqAdmin() {
  const { t, i18n } = useTranslation();
  const [faqs, setFaqs] = useState<FaqData[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [openUpdate, setOpenUpdate] = useState(false);
  const [faq, setFaq] = useState<FaqData | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<number | null>(null);
  const currentSelectedLanguage = localStorage.getItem("i18nextLng") || "en";
  const currentUser = getAuth().currentUser;

  const AccordionDemo = ({ faqs }: { faqs: FaqData[] }) => (
    <Accordion.Root className={styles.AccordionRoot} type="single" collapsible>
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
            <div className={styles.buttonsContainer}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFaq(faq);
                  setOpenUpdate(true);
                }}
                className={`${styles.updateDltBaseButton} ${styles.updateFaqButton}`}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>

              <button
                onClick={(e) => {
                  setFaqToDelete(faq.faq_id);
                  setOpenDeleteConfirm(true);
                }}
                className={`${styles.updateDltBaseButton} ${styles.dltFaqButton}`}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
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

  const getFaqs = async () => {
    try {
      const { data } = await FetchFaq();
      setFaqs(data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFaqs();
  }, []);

  useEffect(() => {
    if (!open) {
      setQuestion("");
      setAnswer("");
    }
  }, [open]);

  // if (loading) {
  //     return (
  //         <div className="loading_wrapper">
  //             <div className="loading_circle"></div>
  //             <div className="loading_circle"></div>
  //             <div className="loading_circle"></div>
  //             <div className="loading_shadow"></div>
  //             <div className="loading_shadow"></div>
  //             <div className="loading_shadow"></div>
  //             <span>Loading</span>
  //         </div>
  //     );
  // }

  async function addFaq(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error(t("questionAnswerRequired"));
      return;
    }

    try {
      const data = {
        question_en: "",
        answer_en: "",
        question_bm: "",
        answer_bm: "",
      };

      if (currentSelectedLanguage === "en") {
        data.question_en = question;
        data.answer_en = answer;
        data.question_bm = await translateText(question, "ms");
        data.answer_bm = await translateText(answer, "ms");
      } else if (currentSelectedLanguage === "bm") {
        data.question_en = await translateText(question, "en");
        data.answer_en = await translateText(answer, "en");
        data.question_bm = question;
        data.answer_bm = answer;
      }
      if (currentUser) {
        await CreateFaq(data, currentUser);
        toast.success(t("faqSuccess"));
        await getFaqs();
      }
    } catch (error) {
      toast.error(t("faqError"));
    } finally {
      setOpen(false);
      setQuestion("");
      setAnswer("");
    }
  }

  const confirmDeleteFaq = async () => {
    if (faqToDelete === null) return;
    try {
      if (currentUser) {
        await DeleteFaq(faqToDelete, currentUser);
        toast.success("FAQ deleted successfully");
        await getFaqs();
      }
    } catch (error) {
      toast.error("Error deleting FAQ");
    } finally {
      setOpenDeleteConfirm(false);
      setFaqToDelete(null);
    }
  };

  async function updateFaq(
    e: React.FormEvent<HTMLFormElement>,
    faq_id: number | undefined
  ) {
    e.preventDefault();

    if (!faq_id) return;

    const form = e.target as HTMLFormElement;
    const question = form.question.value;
    const answer = form.answer.value;

    if (!question.trim() || !answer.trim()) {
      toast.error("Both question and answer fields are required.");
      return;
    }

    try {
      const data = {
        faq_id,
        question_en: "",
        answer_en: "",
        question_bm: "",
        answer_bm: "",
      };

      if (currentSelectedLanguage === "en") {
        data.question_en = question;
        data.answer_en = answer;
        data.question_bm = await translateText(question, "ms");
        data.answer_bm = await translateText(answer, "ms");
      } else if (currentSelectedLanguage === "bm") {
        data.question_en = await translateText(question, "en");
        data.answer_en = await translateText(answer, "en");
        data.question_bm = question;
        data.answer_bm = answer;
      }
      if (currentUser) {
        await UpdateFaq(data, currentUser);
        toast.success("FAQ updated successfully");
        await getFaqs();
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast.error("Error updating FAQ");
    } finally {
      setOpenUpdate(false);
    }
  }

  return (
    <div className={styles.layout}>
      <img
        src="./images/faq.png"
        alt="Frequently Asked Questions"
        className={styles.faqImage}
      />
      <div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <button className={styles.addFaqButton}>{t("add_faq")}</button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className={styles.dialog_overlay} />
            <Dialog.Content
              className={`${styles.dialog_content_base} ${styles.dialog_content}`}
            >
              <Dialog.Title className={styles.dialog_title}>
                {t("create_faq")}
                <i
                  className={`${styles.fa} fa fa-close`}
                  onClick={() => setOpen(false)}
                ></i>
              </Dialog.Title>
              <Dialog.Description className={styles.dialog_description}>
                {t("please_fill")}
              </Dialog.Description>
              <form method="post" onSubmit={addFaq}>
                <fieldset className={styles.Fieldset_question}>
                  <InputField
                    label={t("question")}
                    name="question"
                    value={question}
                    onChange={(e) => {
                      setQuestion(e.target.value);
                    }}
                    error=""
                  />
                </fieldset>

                <fieldset className={styles.Fieldset_answer}>
                  <InputField
                    label={t("answer")}
                    name="answer"
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                    }}
                    multipleLines={true}
                    error=""
                  />
                </fieldset>

                <div
                  style={{
                    display: "flex",
                    marginTop: 25,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className={`${styles.baseButton} ${styles.saveButton}`}
                    type="submit"
                  >
                    {t("save_changes")}
                  </button>
                </div>
              </form>
            </Dialog.Content>
            <Dialog.Close asChild>
              <button className={styles.icon_button} aria-label="Close">
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <AccordionDemo faqs={faqs} />

      <Dialog.Root open={openUpdate} onOpenChange={setOpenUpdate}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialog_overlay} />
          <Dialog.Content
            onOpenAutoFocus={(event) => {
              event?.preventDefault();
            }}
            className={`${styles.dialog_content_base} ${styles.dialog_content}`}
          >
            <Dialog.Title className={styles.dialog_title}>
              {t("update_faq")}
              <i
                className={`${styles.fa} fa fa-close`}
                onClick={() => setOpenUpdate(false)}
              ></i>
            </Dialog.Title>
            <Dialog.Description className={styles.dialog_description}>
              {t("please_fill")}
            </Dialog.Description>
            <form method="post" onSubmit={(e) => updateFaq(e, faq?.faq_id)}>
              <fieldset className={styles.Fieldset_question}>
                <InputField
                  label={t("question")}
                  name="question"
                  value={
                    currentSelectedLanguage === "en"
                      ? (faq && faq.question_en) || ""
                      : (faq && faq.question_bm) || ""
                  }
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setFaq((prevState) => {
                      if (prevState) {
                        return {
                          ...prevState,
                          question_en:
                            currentSelectedLanguage === "en"
                              ? newValue
                              : prevState.question_en,
                          question_bm:
                            currentSelectedLanguage === "bm"
                              ? newValue
                              : prevState.question_bm,
                        };
                      }
                      return null;
                    });
                  }}
                  error=""
                />
              </fieldset>

              <fieldset className={styles.Fieldset_answer}>
                <InputField
                  label={t("answer")}
                  name="answer"
                  value={
                    currentSelectedLanguage === "en"
                      ? faq?.answer_en || ""
                      : faq?.answer_bm || ""
                  }
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setFaq((prevState) => {
                      if (prevState) {
                        return {
                          ...prevState,
                          answer_en:
                            currentSelectedLanguage === "en"
                              ? newValue
                              : prevState.answer_en,
                          answer_bm:
                            currentSelectedLanguage === "bm"
                              ? newValue
                              : prevState.answer_bm,
                        };
                      }
                      return null;
                    });
                  }}
                  multipleLines={true}
                  error=""
                />
              </fieldset>

              <div
                style={{
                  display: "flex",
                  marginTop: 25,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className={`${styles.baseButton} ${styles.saveButton}`}
                  type="submit"
                >
                  {t("save_changes")}
                </button>
              </div>
            </form>
          </Dialog.Content>
          <Dialog.Close asChild>
            <button className={styles.icon_button} aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialog_overlay} />
          <Dialog.Content
            className={`${styles.dialog_content_base} ${styles.dialog_content2}`}
          >
            <Dialog.Title className={styles.dialog_title}>
              {t("confirm_delete")}
            </Dialog.Title>
            <Dialog.Description className={styles.dialog_description2}>
              {t("sure_delete")}
            </Dialog.Description>
            <div className={styles.buttonsConfirmation}>
              <button
                className={`${styles.baseButton} ${styles.noButton}`}
                onClick={() => setOpenDeleteConfirm(false)}
              >
                {t("no")}
              </button>
              <button
                className={`${styles.baseButton} ${styles.yesButton}`}
                onClick={confirmDeleteFaq}
              >
                {t("yes")}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
