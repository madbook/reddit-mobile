import { resetCollapse } from '../../app/actions/comment';

export default async (ctx, dispatch) => {
  dispatch(resetCollapse({}));
};
