import _ from 'lodash';
import Bluebird from 'bluebird';
import { useState, useEffect } from 'react';
import { useSetState } from 'ahooks';
import hashSum from 'hash-sum';

export default function useForm({
  validation,
  initialValues,
  debounceTime = 100,
  onSubmit
}) {
  const startState = _.thru(initialValues, (t) => {
    if (_.isFunction(t)) {
      return validation.cast(t(), { stripUnknown: true });
    } else {
      return initialValues
        ? validation.cast(initialValues, { stripUnknown: true })
        : validation.default();
    }
  });

  const debouncedValidate = _.debounce(validateState, debounceTime, { trailing: true });

  const [formState, setFormState] = useInternalSetFormState(startState, debouncedValidate);
  const [errors, setErrors] = useState(emptyErrors);
  const [dirty, setDirty] = useState(emptyDirty);
  const [submitting, setSubmitting] = useState(false);

  const valid = _.isEmpty(errors);

  return {
    formState,
    setFormValues,
    errors,
    dirty,
    valid,
    submitForm,
    resetForm,
    submitting,
    register: {
      registerInput,
      registerInputNumber,
      registerRadio,
      registerChecked,
      registerRichEdit,
      registerRange,
      registerBitfield,
      registerMetaFields
    }
  };

  //

  function setFormValues(state) {
    setFormState(state);
  }

  function submitForm(submitFn) {
    if (valid) {
      const onSubmitFn = _.isFunction(submitFn) ? submitFn : onSubmit;

      setSubmitting(true);

      return Bluebird
        .resolve(onSubmitFn(formState))
        .finally(() => setSubmitting(false));
    } else {
      setDirty(mapValuesDeep(formState, () => true));
    }
  }

  function resetForm() {
    setFormState(startState);
    setDirty(emptyDirty);
  }

  // only to be used with Semantic UI components - note the data in onChange: (e, data)
  function registerInput(name) {
    return {
      name,
      value: _.get(formState, name),
      onChange: (e, data) => {
        setFormState(prev => _.set({ ...prev }, name, data.value));
        setDirty(prev => _.set({ ...prev }, name, true));
      }
    };
  }

  function registerInputNumber(name) {
    return {
      name,
      error: memNamedError(errors, name),
      value: _.get(formState, name),
      onValueChange: ({ value }) => {
        const hasInput = (value || '').length > 0;
        const setValue = hasInput ? Number(value) : '';

        setFormState(prev => _.set({ ...prev }, name, setValue));
        setDirty(prev => _.set({ ...prev }, name, true));
      }
    };
  }

  function registerRadio(name, value) {
    return {
      name,
      checked: _.get(formState, name) === value,
      onChange: () => {
        setFormState({ [name]: value });
        setDirty(prev => ({
          ...prev,
          [name]: true
        }));
      }
    };
  }

  function registerChecked(name) {
    return {
      name,
      checked: _.get(formState, name) === true,
      onChange: (e, data) => {
        setFormState({ [name]: data.checked });
        setDirty(prev => ({
          ...prev,
          [name]: true
        }));
      }
    };
  }

  function registerRichEdit(name) {
    return {
      name,
      message: _.get(formState, name),
      onChange: ({ content }) => {
        setFormState({ [name]: content });
        setDirty(prev => ({
          ...prev,
          [name]: true
        }));
      }
    };
  }

  function registerRange(name) {
    const value = [_.get(formState, name, {}).min, _.get(formState, name, {}).max];

    return {
      value,
      onChange: ([minValue, maxValue]) => {
        const minField = `${name}.min`;
        const maxField = `${name}.max`;

        setFormState(prev => _.set({ ...prev }, minField, minValue));
        setFormState(prev => _.set({ ...prev }, maxField, maxValue));
      }
    };
  }

  function registerBitfield(name, bit, value) {
    const total = _.get(formState, name);

    return {
      value: 1 << bit,
      checked: (total & value) === value,
      onChange: (e, { checked }) => {
        if (checked) {
          setFormState({ [name]: total | value });
        } else {
          setFormState({ [name]: total & ~value });
        }

        setDirty(prev => ({
          ...prev,
          [name]: true
        }));
      }
    };
  }

  function registerMetaFields() {
    return {
      errors,
      dirty
    };
  }

  async function validateState(values) {
    await validation.validate(values, {
      abortEarly: false
    })
      .then(() => {
        if (!(_.isEmpty(errors))) {
          setErrors(emptyErrors);
        }
      })
      .catch(e => setErrors(e.inner));
  }

  function useInternalSetFormState(initial, callback) {
    const [state, setState] = useSetState(initial);

    useEffect(() => {
      callback(state);

      return () => callback.cancel();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hashSum(state)]);

    return [state, setState];
  }
}

function namedError(errors, name) {
  return !(_.chain(errors).find({ path: name }).isEmpty().value());
}

function mapValuesDeep(obj, fn) {
  return _.mapValues(obj, (val, key) =>
    _.isPlainObject(val)
      ? mapValuesDeep(val, fn)
      : fn(val, key, obj)
  );
}

const memNamedError = _.memoize(namedError, (...args) => hashSum(args));
const emptyErrors = [];
const emptyDirty = {};
