import { baseAPIUrl } from "@/constants/constants";

export class DeskCardModel {
  id;
  icon;
  label;
  link;

  constructor(payload) {
    this.id = payload.id;
    this.label = payload.label;
    this.link = payload.link;
    const iconURL = payload.icon?.data?.attributes?.url
    this.icon = iconURL ? `${baseAPIUrl}${iconURL}` : '';
  }
}
