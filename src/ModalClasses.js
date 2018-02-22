// @flow
import { css } from 'emotion'

export default {
  modal: css`
    padding: 0 !important;
    & .modal-dialog {
      width: 80vw;
      max-width: 70rem;
      transition: width 0.3s ease-out, -webkit-transform 0.3s ease-out !important;
    }
    @media (max-width: 767px) {
      & .modal-dialog {
        width: auto !important;
      }
      & .panel-body {
        padding: 0;
      }
    }
    @media (min-width: 768px) and (max-width: 992px) {
      & :global(.modal-dialog) {
        width: 95vw;
      }
    }
  `,
  anyImage: css`
    display: block;
    margin: 0 auto;
    max-height: 100%;
    max-width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `,
  imageHolder: css`
    height: 0;
    padding-bottom: 56.25%;
    position: relative;
  `
}
