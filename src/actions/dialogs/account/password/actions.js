import validate from '../../../../helpers/validate';
import hasErrors from '../../../../helpers/has-errors';

import { openSnackbar } from '../../../root/snackbar/actions';

import { apiPatch } from '../../../api';

import {
  dialogAccountPasswordFormUpdate,
  dialogAccountPasswordSaveRequest,
  dialogAccountPasswordSaveSuccess,
} from './action-creators';

const getValidationRules = state => ({
  currentPassword: {
    fieldName: 'Current password',
    required: true,
  },
  password: {
    fieldName: 'New password',
    required: true,
    minLength: 6,
  },
  confirmPassword: {
    fieldName: 'Password confirmation',
    required: true,
    matched: {
      otherFieldName: 'New password',
      otherVal: state.dialogs.account.password.form.password,
    },
  },
});

export const formUpdate = changes =>
  (dispatch, getState) => {
    const validatedChanges = validate(changes, getValidationRules(getState()));
    dispatch(dialogAccountPasswordFormUpdate(validatedChanges));
  };

export const save = () =>
  (dispatch, getState) => {
    const changes = getState().dialogs.account.password.form;

    const validatedChanges = validate(changes, getValidationRules(getState()));
    if (hasErrors(validatedChanges)) {
      return dispatch(formUpdate(validatedChanges));
    }

    const newChanges = {
      currentPassword: changes.currentPassword,
      password: changes.password,
    };

    dispatch(dialogAccountPasswordSaveRequest());
    return dispatch(apiPatch('/user/password', newChanges))
      .then(() => {
        dispatch(dialogAccountPasswordSaveSuccess());
        dispatch(openSnackbar('Your password has been updated!'));
      })
      .catch(() => dispatch(openSnackbar('WebCatalog failed to update your password.')));
  };
