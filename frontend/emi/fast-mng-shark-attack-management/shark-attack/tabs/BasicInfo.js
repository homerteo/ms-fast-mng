import React from "react";
import {
  TextField,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { FuseAnimate, FuseLoading } from "@fuse";
import { useSelector, useDispatch } from "react-redux";
import * as Actions from "../../store/actions";
import * as Yup from "yup";
import _ from "@lodash";

export function basicInfoFormValidationsGenerator(T) {
  return {
    date: Yup.string().required(
      T.translate("shark_attack.form_validations.date.required")
    ),
    year: Yup.string().required(
      T.translate("shark_attack.form_validations.year.required")
    ),
    type: Yup.string().required(
      T.translate("shark_attack.form_validations.type.required")
    ),
    country: Yup.string().required(
      T.translate("shark_attack.form_validations.country.required")
    ),
    area: Yup.string().required(
      T.translate("shark_attack.form_validations.area.required")
    ),
    location: Yup.string().required(
      T.translate("shark_attack.form_validations.location.required")
    ),
    activity: Yup.string().required(
      T.translate("shark_attack.form_validations.activity.required")
    ),
    name: Yup.string()
      .min(
        3,
        T.translate("shark_attack.form_validations.name.length", { len: 3 })
      )
      .required(T.translate("shark_attack.form_validations.name.required")),
    sex: Yup.string()
      .oneOf(["M", "F"], T.translate("shark_attack.form_validations.sex.oneOf"))
      .required(T.translate("shark_attack.form_validations.sex.required")),
    age: Yup.string()
      .min(0, T.translate("shark_attack.form_validations.age.min"))
      .required(T.translate("shark_attack.form_validations.age.required")),
    injury: Yup.string().required(
      T.translate("shark_attack.form_validations.injury.required")
    ),
    fatal_y_n: Yup.string()
      .oneOf(
        ["Y", "N"],
        T.translate("shark_attack.form_validations.fatal_y_n.oneOf")
      )
      .required(
        T.translate("shark_attack.form_validations.fatal_y_n.required")
      ),
    time: Yup.string().required(
      T.translate("shark_attack.form_validations.time.required")
    ),
    species: Yup.string().required(
      T.translate("shark_attack.form_validations.species.required")
    ),
    investigator_or_source: Yup.string().required(
      T.translate(
        "shark_attack.form_validations.investigator_or_source.required"
      )
    ),
    pdf: Yup.string().required(
      T.translate("shark_attack.form_validations.pdf.required")
    ),
    href_formula: Yup.string().required(
      T.translate("shark_attack.form_validations.href_formula.required")
    ),
    href: Yup.string()
      .url(T.translate("shark_attack.form_validations.href.url"))
      .required(T.translate("shark_attack.form_validations.href.required")),
    case_number: Yup.string().required(
      T.translate("shark_attack.form_validations.case_number.required")
    ),
    case_number0: Yup.string().required(
      T.translate("shark_attack.form_validations.case_number0.required")
    ),
  };
}

/**
 * Aggregate BasicInfo form
 * @param {{dataSource,T}} props
 */
export function BasicInfo(props) {
  const { dataSource: form, T, onChange, errors, touched, canWrite } = props;
  const { filters, rowsPerPage, page, order, totalDataCount, loading } =
    useSelector(
      ({ SharkAttackManagement }) => SharkAttackManagement.sharkAttacks
    );
  const dispatch = useDispatch();

  function handleRequestImportByCountrySharkAttacks(event, property) {
    dispatch(
      Actions.importByCountrySharkAttack(
        { filters, order, page, rowsPerPage },
        form.country
      )
    );
  }
    if (loading) {
        return (<FuseLoading />);
    }
  return (
    <div>
      <TextField
        className="mt-8 mb-16"
        helperText={errors.name && touched.name && errors.name}
        error={errors.name && touched.name}
        required
        label={T.translate("shark_attack.name")}
        autoFocus
        id="name"
        name="name"
        value={form.name}
        onChange={onChange("name")}
        onBlur={onChange("name")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.date && touched.date && errors.date}
        error={errors.date && touched.date}
        required
        label={T.translate("shark_attack.date")}
        id="date"
        name="date"
        value={form.date}
        onChange={onChange("date")}
        onBlur={onChange("date")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.year && touched.year && errors.year}
        error={errors.year && touched.year}
        required
        label={T.translate("shark_attack.year")}
        id="year"
        name="year"
        value={form.year}
        onChange={onChange("year")}
        onBlur={onChange("year")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.type && touched.type && errors.type}
        error={errors.type && touched.type}
        required
        label={T.translate("shark_attack.type")}
        id="type"
        name="type"
        value={form.type}
        onChange={onChange("type")}
        onBlur={onChange("type")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.country && touched.country && errors.country}
        error={errors.country && touched.country}
        required
        label={T.translate("shark_attack.country")}
        id="country"
        name="country"
        value={form.country}
        onChange={onChange("country")}
        onBlur={onChange("country")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.area && touched.area && errors.area}
        error={errors.area && touched.area}
        required
        label={T.translate("shark_attack.area")}
        id="area"
        name="area"
        value={form.area}
        onChange={onChange("area")}
        onBlur={onChange("area")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.location && touched.location && errors.location}
        error={errors.location && touched.location}
        required
        label={T.translate("shark_attack.location")}
        id="location"
        name="location"
        value={form.location}
        onChange={onChange("location")}
        onBlur={onChange("location")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.activity && touched.activity && errors.activity}
        error={errors.activity && touched.activity}
        required
        label={T.translate("shark_attack.activity")}
        id="activity"
        name="activity"
        value={form.activity}
        onChange={onChange("activity")}
        onBlur={onChange("activity")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.sex && touched.sex && errors.sex}
        error={errors.sex && touched.sex}
        required
        label={T.translate("shark_attack.sex")}
        id="sex"
        name="sex"
        value={form.sex}
        onChange={onChange("sex")}
        onBlur={onChange("sex")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.age && touched.age && errors.age}
        error={errors.age && touched.age}
        required
        label={T.translate("shark_attack.age")}
        id="age"
        name="age"
        value={form.age}
        onChange={onChange("age")}
        onBlur={onChange("age")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.injury && touched.injury && errors.injury}
        error={errors.injury && touched.injury}
        required
        label={T.translate("shark_attack.injury")}
        id="injury"
        name="injury"
        value={form.injury}
        onChange={onChange("injury")}
        onBlur={onChange("injury")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.fatal_y_n && touched.fatal_y_n && errors.fatal_y_n}
        error={errors.fatal_y_n && touched.fatal_y_n}
        required
        label={T.translate("shark_attack.fatal_y_n")}
        id="fatal_y_n"
        name="fatal_y_n"
        value={form.fatal_y_n}
        onChange={onChange("fatal_y_n")}
        onBlur={onChange("fatal_y_n")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.time && touched.time && errors.time}
        error={errors.time && touched.time}
        required
        label={T.translate("shark_attack.time")}
        id="time"
        name="time"
        value={form.time}
        onChange={onChange("time")}
        onBlur={onChange("time")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.species && touched.species && errors.species}
        error={errors.species && touched.species}
        required
        label={T.translate("shark_attack.species")}
        id="species"
        name="species"
        value={form.species}
        onChange={onChange("species")}
        onBlur={onChange("species")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={
          errors.investigator_or_source &&
          touched.investigator_or_source &&
          errors.investigator_or_source
        }
        error={errors.investigator_or_source && touched.investigator_or_source}
        required
        label={T.translate("shark_attack.investigator_or_source")}
        id="investigator_or_source"
        name="investigator_or_source"
        value={form.investigator_or_source}
        onChange={onChange("investigator_or_source")}
        onBlur={onChange("investigator_or_source")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.pdf && touched.pdf && errors.pdf}
        error={errors.pdf && touched.pdf}
        required
        label={T.translate("shark_attack.pdf")}
        id="pdf"
        name="pdf"
        value={form.pdf}
        onChange={onChange("pdf")}
        onBlur={onChange("pdf")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={
          errors.href_formula && touched.href_formula && errors.href_formula
        }
        error={errors.href_formula && touched.href_formula}
        required
        label={T.translate("shark_attack.href_formula")}
        id="href_formula"
        name="href_formula"
        value={form.href_formula}
        onChange={onChange("href_formula")}
        onBlur={onChange("href_formula")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={errors.href && touched.href && errors.href}
        error={errors.href && touched.href}
        required
        label={T.translate("shark_attack.href")}
        id="href"
        name="href"
        value={form.href}
        onChange={onChange("href")}
        onBlur={onChange("href")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={
          errors.case_number && touched.case_number && errors.case_number
        }
        error={errors.case_number && touched.case_number}
        required
        label={T.translate("shark_attack.case_number")}
        id="case_number"
        name="case_number"
        value={form.case_number}
        onChange={onChange("case_number")}
        onBlur={onChange("case_number")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={
          errors.case_number0 && touched.case_number0 && errors.case_number0
        }
        error={errors.case_number0 && touched.case_number0}
        required
        label={T.translate("shark_attack.case_number0")}
        id="case_number0"
        name="case_number0"
        value={form.case_number0}
        onChange={onChange("case_number0")}
        onBlur={onChange("case_number0")}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <TextField
        className="mt-8 mb-16"
        helperText={
          errors.description && touched.description && errors.description
        }
        error={errors.description && touched.description}
        id="description"
        name="description"
        onChange={onChange("description")}
        onBlur={onChange("description")}
        label={T.translate("shark_attack.description")}
        type="text"
        value={form.description}
        multiline
        rows={5}
        variant="outlined"
        fullWidth
        InputProps={{
          readOnly: !canWrite(),
        }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={form.active}
            onChange={onChange("active")}
            id="active"
            name="active"
            value={form.active}
            inputProps={{ "aria-label": "primary checkbox" }}
            variant="outlined"
            disabled={!canWrite()}
          />
        }
        label={T.translate("shark_attack.active")}
      />
      <FuseAnimate animation="transition.slideRightIn" delay={300}>
        <Button
          onClick={handleRequestImportByCountrySharkAttacks}
          className="whitespace-no-wrap"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          <span className="hidden sm:flex">
            {T.translate("shark_attacks.import_shark_attacks_by_Country")}{" "}
            {form.country}
          </span>
          <span className="flex sm:hidden">
            {T.translate("shark_attacks.import_shark_attacks_by_Country_short")}{" "}
            {form.country}
          </span>
        </Button>
      </FuseAnimate>
    </div>
  );
}
