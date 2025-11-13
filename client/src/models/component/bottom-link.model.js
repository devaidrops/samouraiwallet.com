import { baseAPIUrl } from "@/constants/constants";

export class BottomLinkModel {
  id;
  icon;
  label;

  constructor(payload) {
    this.id = payload.id;
    this.label = payload.label;
    const iconURL = payload.icon?.data?.attributes?.url
    this.icon = iconURL ? `${baseAPIUrl}${iconURL}` : '';
  }
}
