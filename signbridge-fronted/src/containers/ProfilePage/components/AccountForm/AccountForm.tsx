import React, { ChangeEvent, useState, useEffect } from "react";
import * as Ariakit from "@ariakit/react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";
import AccountInputField from "../accountInputFields/accountInputFields";
import { useTranslation } from "react-i18next";
import style from "./AccountForm.module.css";
// @ts-ignore
import { storage } from "../../../../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FetchAllCountries } from "@root/services/account.service";
import { UpdateUserProfileById } from "@root/services/account.service";

import { useUserStore } from "@root/store/userStore";
import { getAuth } from "firebase/auth";

type Country = {
  country: string;
  state: State[];
};

type State = {
  name: string;
  city: string[];
};

const AccountForm = () => {
  const { user, setUser } = useUserStore();
  const [formData, setFormData] = useState({
    username: user?.username ?? "",
    firstName: user?.first_name ?? "",
    lastName: user?.last_name ?? "",
    user_id: user?.user_id ?? "",
    age: user?.age ?? "",
    gender: user?.gender ?? "",
    race: user?.race ?? "",
    country: user?.country ?? "",
    city: user?.city ?? "",
    state: user?.state ?? "",
    picture: null as File | null,
  });

  const [error, setError] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    gender: "",
    race: "",
  });
  const currentUser = getAuth().currentUser;

  const { t } = useTranslation();
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [selectCountryOpen, setSelectCountryOpen] = useState(false);
  const [selectCityOpen, setSelectCityOpen] = useState(false);
  const [selectStateOpen, setSelectStateOpen] = useState(false);

  const [selectedCountryOption, setSelectedCountryOption] = useState(
    user?.country ?? ""
  );
  const [selectedStateOption, setSelectedStateOption] = useState(
    user?.state ?? ""
  );
  const [selectedCityOption, setSelectedCityOption] = useState(
    user?.city ?? ""
  );

  const [image, setImage] = useState<string | null>(user?.picture ?? null);
  const [customKey, setCustomKey] = useState(0);

  async function fetchCountry() {
    if (currentUser) {
      const response = await FetchAllCountries(currentUser);
      setCountries(response.data);
    }
  }

  useEffect(() => {
    fetchCountry();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let isValid = true;

    if (isValid) {
      if (type === "radio" && name === "gender") {
        setFormData({ ...formData, gender: value });
      } else if (type === "radio") {
        setFormData({ ...formData, [name]: parseInt(value) });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }

    let errorMessage = "";

    switch (name) {
      case "firstName":
        errorMessage = validateFirstName(value)
          ? ""
          : "First name must be at least 3 characters long";
        break;
      case "lastName":
        errorMessage = validateLastName(value)
          ? ""
          : "Last name must be at least 3 characters long";
        break;
      case "age":
        errorMessage = validateAge(value)
          ? ""
          : "Age must be between 2 and 150";
        break;
      case "race":
        errorMessage = validateRace(value)
          ? ""
          : "Race must contain only letters and be at least 3 characters long";
        break;
      default:
        break;
    }

    setError((prevError) => ({
      ...prevError,
      [name]: errorMessage,
    }));

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];

    setFormData((prevFormData) => ({
      ...prevFormData,
      picture: e.target.files ? e.target.files[0] : null,
    }));

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ---------- Validation Functions ----------
  const validateFirstName = (value: string) => {
    if (value && value.trim() !== "" && value.length < 3) {
      setError((prev) => ({ ...prev, firstName: t("firstNameLength") }));
      return false;
    }
    setError((prev) => ({ ...prev, firstName: "" }));
    return true;
  };

  const validateLastName = (value: string) => {
    if (value && value.trim() !== "" && value.length < 3) {
      setError((prev) => ({ ...prev, lastName: t("lastNameLength") }));
      return false;
    }
    setError((prev) => ({ ...prev, lastName: "" }));
    return true;
  };

  const validateAge = (value: string) => {
    if (
      value &&
      value.trim() !== "" &&
      (+value < 2 || +value > 150 || isNaN(+value))
    ) {
      setError((prev) => ({ ...prev, age: t("ageLength") }));
      return false;
    }
    setError((prev) => ({ ...prev, age: "" }));
    return true;
  };

  const validateRace = (value: string) => {
    if (value && value.trim() !== "") {
      const lettersRegex = /^[a-zA-Z]+$/;
      if (!lettersRegex.test(value)) {
        setError((prev) => ({ ...prev, race: t("raceLetters") }));
        return false;
      } else if (value.length < 3) {
        setError((prev) => ({ ...prev, race: t("raceLength") }));
        return false;
      }
    }
    setError((prev) => ({ ...prev, race: "" }));
    return true;
  };

  const uploadInputData = async (url?: string) => {
    if (!user) {
      return;
    }

    const data = new FormData();

    if (formData.username) {
      data.append("username", formData.username);
    }

    if (formData.picture) {
      data.append("picture", formData.picture);
    }

    if (formData.firstName) {
      data.append("first_name", formData.firstName);
    }

    if (formData.lastName) {
      data.append("last_name", formData.lastName);
    }

    if (formData.age) {
      data.append("age", formData.age);
    }

    if (formData.gender) {
      data.append("gender", formData.gender);
    }

    if (formData.race) {
      data.append("race", formData.race);
    }

    if (formData.country) {
      data.append("country", formData.country);
    }

    if (formData.city) {
      data.append("city", formData.city);
    }

    if (formData.state) {
      data.append("state", formData.state);
    }

    if (url) {
      data.append("picture", url);
    }
    if (currentUser) {
      const result = await UpdateUserProfileById(
        user.firebase_id,
        data,
        currentUser
      );
      if (result) {
        setUser({
          ...user,
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          age: formData.age,
          gender: formData.gender,
          race: formData.race,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          picture: url ?? user.picture,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isFirstNameValid = validateFirstName(formData.firstName);
    const isLastNameValid = validateLastName(formData.lastName);
    const isAgeValid = validateAge(formData.age ?? "");
    const isRaceValid = validateRace(formData.race);
    if (isFirstNameValid && isLastNameValid && isAgeValid && isRaceValid) {
      if (user && formData.picture) {
        const storageRef = ref(storage, `userProfileImage/${user.firebase_id}`);
        await uploadBytes(storageRef, formData.picture)
          .then(async (snapshot) => {
            const downloadURL = await getDownloadURL(storageRef);
            await uploadInputData(downloadURL);
          })
          .catch((error) => {
            // console.log(error);
          });
      } else {
        await uploadInputData();
      }

      toast.success(t("personalSuccess"));
    } else {
      toast.error(t("personalFailed"));
    }
  };

  return (
    <div className={style.accountFormContainer}>
      <div className={style.accountContent}>
        <h1>{t("personalDetail")}</h1>
        <form onSubmit={handleSubmit} className={style.form} key={customKey}>
          <AccountInputField
            label={t("accountUsername")}
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={error.username}
          />
          <div className={style.inputGroup}>
            <AccountInputField
              label={t("accountFirstName")}
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={error.firstName}
            />
            <AccountInputField
              label={t("accountLastName")}
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={error.lastName}
            />
          </div>
          <div className={style.inputGroup}>
            <AccountInputField
              label={t("accountAge")}
              name="age"
              value={formData.age}
              onChange={handleChange}
              error={error.age}
            />
            <div className={style.radio_group}>
              <label className={style.genderLabel}>{t("accountGender")}</label>
              <div className={style.gender}>
                <input
                  type="radio"
                  name="gender"
                  id="male"
                  value="male"
                  onChange={handleChange}
                  checked={formData.gender === "male"}
                />
                <label htmlFor="male"> {t("accountMale")}</label>
                <input
                  type="radio"
                  name="gender"
                  id="female"
                  value="female"
                  className="female"
                  onChange={handleChange}
                  checked={formData.gender === "female"}
                />
                <label htmlFor="female"> {t("accountFemale")}</label>
              </div>
            </div>
          </div>
          <AccountInputField
            label={t("accountRace")}
            name="race"
            value={formData.race}
            onChange={handleChange}
            error={error.race}
          />

          <div className={style.selectContainer}>
            <Ariakit.SelectProvider
              setOpen={(open) => {
                setSelectCountryOpen(open);
              }}
              setValue={(value) => {
                setSelectedCountryOption(value);
              }}
              defaultValue={formData.country ?? ""}
            >
              <Ariakit.SelectLabel className={style.label}>
                {t("accountCountry")}
              </Ariakit.SelectLabel>
              <Ariakit.Select className={style.selectTrigger}>
                {selectedCountryOption
                  ? selectedCountryOption
                  : t("selectCountry")}
                <div
                  className={`${style.selectTriggerIcon} ${
                    selectCountryOpen ? style.selectIconFocus : ""
                  }`}
                >
                  <ChevronDownIcon />
                </div>
              </Ariakit.Select>
              <Ariakit.SelectPopover
                gutter={4}
                sameWidth
                className={style.selectPopover}
              >
                {countries?.map((country, index) => (
                  <Ariakit.SelectItem
                    key={index}
                    className={style.selectItem}
                    value={country.country}
                    onClick={() => {
                      setSelectedCountryOption(country.country);
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        country: country.country,
                      }));
                      setSelectCountryOpen(false);
                    }}
                  />
                ))}
              </Ariakit.SelectPopover>
            </Ariakit.SelectProvider>
          </div>

          <div className={style.selectContainer}>
            <Ariakit.SelectProvider
              setOpen={(open) => {
                setSelectStateOpen(open);
              }}
              setValue={(value) => {
                setSelectedStateOption(value);
              }}
              defaultValue={formData.state ?? ""}
            >
              <Ariakit.SelectLabel className={style.label}>
                {t("accountState")}
              </Ariakit.SelectLabel>
              <Ariakit.Select className={style.selectTrigger}>
                {selectedStateOption ? selectedStateOption : t("selectState")}
                <div
                  className={`${style.selectTriggerIcon} ${
                    selectStateOpen ? style.selectIconFocus : ""
                  }`}
                >
                  <ChevronDownIcon />
                </div>
              </Ariakit.Select>
              <Ariakit.SelectPopover
                gutter={4}
                sameWidth
                className={style.selectPopover}
              >
                {selectedCountryOption
                  ? countries
                      ?.filter(
                        (country) => country.country === selectedCountryOption
                      )[0]
                      .state.map((state, index) => (
                        <Ariakit.SelectItem
                          key={index}
                          className={style.selectItem}
                          value={state.name}
                          onClick={() => {
                            setSelectedStateOption(state.name);
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              state: state.name,
                            }));
                            setSelectStateOpen(false);
                            setSelectedCityOption("");
                          }}
                        />
                      ))
                  : null}
              </Ariakit.SelectPopover>
            </Ariakit.SelectProvider>
          </div>

          <div className={style.selectContainer}>
            <Ariakit.SelectProvider
              setOpen={(open) => {
                setSelectCityOpen(open);
              }}
              setValue={(value) => {
                setSelectedCityOption(value);
              }}
              defaultValue={formData.city ?? ""}
            >
              <Ariakit.SelectLabel className={style.label}>
                {t("accountCity")}
              </Ariakit.SelectLabel>
              <Ariakit.Select className={style.selectTrigger}>
                {selectedCityOption ? selectedCityOption : t("selectCity")}
                <div
                  className={`${style.selectTriggerIcon} ${
                    selectCityOpen ? style.selectIconFocus : ""
                  }`}
                >
                  <ChevronDownIcon />
                </div>
              </Ariakit.Select>
              <Ariakit.SelectPopover
                gutter={4}
                sameWidth
                className={style.selectPopover}
              >
                {selectedStateOption
                  ? countries
                      ?.filter(
                        (country) => country.country === selectedCountryOption
                      )[0]
                      .state.filter(
                        (state) => state.name === selectedStateOption
                      )[0]
                      .city.map((city, index) => (
                        <Ariakit.SelectItem
                          key={index}
                          className={style.selectItem}
                          value={city}
                          onClick={() => {
                            setSelectedCityOption(city);
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              city: city,
                            }));
                            setSelectCityOpen(false);
                          }}
                        />
                      ))
                  : null}
              </Ariakit.SelectPopover>
            </Ariakit.SelectProvider>
          </div>

          {/* Upload Image */}
          <div className={style.imageUploader}>
            <label htmlFor="file" className={style.uploadLabel}>
              {image ? (
                <img
                  src={image ?? ""}
                  alt="Uploaded"
                  className={style.uploadedImage}
                />
              ) : (
                <span>{t("uploadAccImage")}</span>
              )}
            </label>
            <label htmlFor="file" className={style.uploadButton}>
              {t("selectAccImage")}
              <input
                type="file"
                id="file"
                className={style.uploadInput}
                onChange={handleImageChange}
                style={{ display: "none" }}
                accept="image/jpeg, image/png, image/jpg"
              />
            </label>
          </div>

          <button type="submit" className={style.submitButton}>
            {t("submit_btn")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;
