import React, { useEffect, useState } from "react";
import CollapsibleContainer from "../components/CollapsibleContainer/CollapsibleContainer";
import FeedbackOrderFilter from "../components/Filter/FeedbackOrderSorting/FeedbackOrderSorting";
import FeedbackFieldsFilter from "../components/Filter/FeedbackFieldsFilter/FeedbackFieldsFilter";
import TablePagination from "@mui/material/TablePagination";
import style from "./FeedbackAdmin.module.css";
import { GetFeedback, UpdateFeedback } from "../../../services/feedback.service";
import { useFeedbackSortFilterStore } from "../../../store/feedbackSortFilter";
import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";

const FeedbackAdmin: React.FC = () => {
    const { t, i18n } = useTranslation();
    const store = useFeedbackSortFilterStore();

    const [collapsibleData, setCollapsibleData] = useState<any[]>([]);
    const [modifiedCollapsibleData, setModifiedCollapsibleData] = useState<any[]>([]);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const currentUser = getAuth().currentUser;
    // Fetch data from server
    useEffect(() => {
        if (currentUser) {
            GetFeedback(currentUser)
                .then(res => {
                    setCollapsibleData(res.data);
                    setModifiedCollapsibleData(res.data);
                    store.setData(res.data);
                    store.setModifiedData(res.data);
                })
                .catch(err => {
                    console.error("Error fetching feedback:", err);
                })
                .finally(() => {
                    // No need to setLoading(false) here, as we're not using a loading state
                });
        }
    }, []);

    // a function to format the date to yyyy-mm-dd
    const formatDate = (date: string) => {
        return new Date(date).toISOString().split("T")[0];
    };

    // write a function to sort the data based on the sortOrder
    const sortData = () => {
        if (store.sortBy === "asc") {
            if (store.field === "ID") {
                store.setModifiedData(collapsibleData.sort((a: any, b: any) => a.feedback_id - b.feedback_id));
            } else if (store.field === "Name") {
                store.setModifiedData(collapsibleData.sort((a: any, b: any) => a.firstName.localeCompare(b.firstName)));
            } else if (store.field === "Age") {
                store.setModifiedData(collapsibleData.sort((a: any, b: any) => parseInt(a.age) - parseInt(b.age)));
            }
        } else if (store.sortBy === "desc") {
            if (store.field === "ID") {
                store.setModifiedData(collapsibleData.sort((a: any, b: any) => b.feedback_id - a.feedback_id));
            } else if (store.field === "Name") {
                store.setModifiedData(collapsibleData.sort((a: any, b: any) => b.firstName.localeCompare(a.firstName)));
            } else if (store.field === "Age") {
                store.setModifiedData(collapsibleData.sort((a: any, b: any) => parseInt(b.age) - parseInt(a.age)));
            }
        } else if (store.field === "Category") {
            if (store.filterBy === "whole website") {
                store.setModifiedData(collapsibleData.filter((data: any) => data.fcategory === "Whole Website"));
            } else if (store.filterBy === "game1") {
                store.setModifiedData(collapsibleData.filter((data: any) => data.fcategory === "Game 1"));
            } else if (store.filterBy === "game2") {
                store.setModifiedData(collapsibleData.filter((data: any) => data.fcategory === "Game 2"));
            }
        } else if (store.field === "Status") {
            if (store.filterBy === "new") {
                store.setModifiedData(collapsibleData.filter((data: any) => data.status_en === "New"));
            } else if (store.filterBy === "viewed") {
                store.setModifiedData(collapsibleData.filter((data: any) => data.status_en === "Viewed"));
            }
        }
    };

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginationCount = store.modifiedData.length;

    return (
        <div className={style.feedbackAdmin_container}>
            <>
                <h1>{t("feedback_review")}</h1>
                <div className={style.feedbackAdmin_containerbox}>
                    <div className={style.feedbackAdmin_filterbox}>
                        <FeedbackFieldsFilter sortData={sortData} />
                        <FeedbackOrderFilter sortData={sortData} />
                    </div>
                    {/* Render only the data for the current page */}
                    {store.modifiedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((data: any) => (
                        <CollapsibleContainer
                            key={data.feedback_id}
                            updateStatus={() => {
                                if (currentUser) {
                                    UpdateFeedback(data.feedback_id, currentUser).then(() => {
                                        setCollapsibleData(prevData =>
                                            prevData.map(item =>
                                                item.feedback_id === data.feedback_id
                                                    ? {
                                                          ...item,
                                                          status_en: "Viewed",
                                                          status_bm: "Dilihat",
                                                      }
                                                    : item
                                            )
                                        );
                                    });
                                }
                            }}
                            id={data.feedback_id}
                            name={data.firstName + " " + data.lastName}
                            age={data.age}
                            gender={data.gender}
                            race={data.race}
                            email={data.email}
                            fcategory={data.fcategory}
                            experience={data.experience}
                            friendliness={data.friendliness}
                            quality={data.quality}
                            recommended={data.recommended}
                            q1_en={data.question1_en}
                            q2_en={data.question2_en}
                            q3_en={data.question3_en}
                            q1_bm={data.question1_bm}
                            q2_bm={data.question2_bm}
                            q3_bm={data.question3_bm}
                            image={data.imageURL}
                            created_at={formatDate(data.createdAt)}
                            status_en={data.status_en}
                            status_bm={data.status_bm}
                        />
                    ))}

                    <TablePagination component="div" count={paginationCount} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} />
                </div>
            </>
        </div>
    );
};

export default FeedbackAdmin;
