import { resetCollapse } from '../../app/actions/commentActions';

export default async (ctx, dispatch) => {
  dispatch(resetCollapse({}));
};
