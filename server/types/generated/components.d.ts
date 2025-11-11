import type { Schema, Attribute } from '@strapi/strapi';

export interface SidebarQuiz extends Schema.Component {
  collectionName: 'components_sidebar_quizzes';
  info: {
    displayName: 'Quiz';
    description: '';
  };
  attributes: {
    question: Attribute.String;
    quiz_options: Attribute.Component<'sidebar.quiz-option', true>;
  };
}

export interface SidebarQuizOption extends Schema.Component {
  collectionName: 'components_sidebar_quiz_options';
  info: {
    displayName: 'Quiz Option';
    description: '';
  };
  attributes: {
    option_text: Attribute.String;
    upvotes: Attribute.Integer & Attribute.DefaultTo<0>;
  };
}

export interface SidebarCurrentReviews extends Schema.Component {
  collectionName: 'components_sidebar_current_reviews';
  info: {
    displayName: 'Current Reviews';
    description: '';
  };
  attributes: {
    title: Attribute.String;
    reviews: Attribute.Relation<
      'sidebar.current-reviews',
      'oneToMany',
      'api::review.review'
    >;
    heading_img: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface SidebarCurrentPost extends Schema.Component {
  collectionName: 'components_sidebar_current_posts';
  info: {
    displayName: 'Current Post';
    description: '';
  };
  attributes: {
    posts: Attribute.Relation<
      'sidebar.current-post',
      'oneToMany',
      'api::post.post'
    >;
    title: Attribute.String;
    heading_img: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface ReviewTriggerWidget extends Schema.Component {
  collectionName: 'components_review_trigger_widgets';
  info: {
    displayName: 'Trigger Widget';
    description: '';
  };
  attributes: {
    label: Attribute.String;
    icon: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    tooltip_title: Attribute.String;
    tooltip_content: Attribute.Text;
  };
}

export interface ReviewTriggerValue extends Schema.Component {
  collectionName: 'components_review_trigger_values';
  info: {
    displayName: 'Trigger Value';
    description: '';
  };
  attributes: {
    widget_min_deposit_withdrawal: Attribute.String;
    widget_trading_volume: Attribute.String;
    widget_verification: Attribute.String;
    widget_spot_commission: Attribute.String;
    widget_futures_commission: Attribute.String;
    widget_min_deposit_withdrawal_label: Attribute.String;
    widget_trading_volume_label: Attribute.String;
    widget_verification_label: Attribute.String;
    widget_spot_commission_label: Attribute.String;
    widget_futures_commission_label: Attribute.String;
  };
}

export interface ReviewSummaryRating extends Schema.Component {
  collectionName: 'components_review_summary_ratings';
  info: {
    displayName: 'Summary Rating';
    description: '';
  };
  attributes: {
    rating: Attribute.Decimal;
    title: Attribute.String;
  };
}

export interface ReviewReviewOptions extends Schema.Component {
  collectionName: 'components_review_review_options';
  info: {
    displayName: 'Review Options';
    description: '';
  };
  attributes: {
    widget_min_deposit_withdrawal: Attribute.Component<'review.trigger-widget'>;
    widget_trading_volume: Attribute.Component<'review.trigger-widget'>;
    widget_verification: Attribute.Component<'review.trigger-widget'>;
    widget_spot_commission: Attribute.Component<'review.trigger-widget'>;
    widget_futures_commission: Attribute.Component<'review.trigger-widget'>;
    company_info_widgets: Attribute.Component<'review.trigger-widget', true>;
  };
}

export interface ReviewProsCons extends Schema.Component {
  collectionName: 'components_review_pros_cons';
  info: {
    displayName: 'ProsCons';
    description: '';
  };
  attributes: {
    text: Attribute.String;
  };
}

export interface ReviewContentMenu extends Schema.Component {
  collectionName: 'components_review_content_menus';
  info: {
    displayName: 'Content Menu';
  };
  attributes: {
    link: Attribute.String;
    label: Attribute.String;
  };
}

export interface ReviewCompanyInfo extends Schema.Component {
  collectionName: 'components_review_company_infos';
  info: {
    displayName: 'Company Info';
    description: '';
  };
  attributes: {
    value: Attribute.String;
    link: Attribute.String;
    title: Attribute.String;
  };
}

export interface SharedRatingLabel extends Schema.Component {
  collectionName: 'components_shared_rating_labels';
  info: {
    displayName: 'Rating Label';
  };
  attributes: {
    label: Attribute.String;
  };
}

export interface SharedMeta extends Schema.Component {
  collectionName: 'components_shared_metas';
  info: {
    displayName: 'Meta';
    description: '';
  };
  attributes: {
    title: Attribute.String;
    description: Attribute.String;
  };
}

export interface SharedLabel extends Schema.Component {
  collectionName: 'components_shared_labels';
  info: {
    displayName: '\u0422\u0435\u043A\u0441\u0442';
  };
  attributes: {
    value: Attribute.String;
  };
}

export interface SharedImage extends Schema.Component {
  collectionName: 'components_shared_images';
  info: {
    displayName: '\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435';
  };
  attributes: {
    value: Attribute.Media<'images'>;
  };
}

export interface HomepageDeskCard extends Schema.Component {
  collectionName: 'components_homepage_desk_cards';
  info: {
    displayName: 'Desk Card';
    description: '';
  };
  attributes: {
    icon: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    link: Attribute.String;
    label: Attribute.String;
  };
}

export interface ConfigReviewValueList extends Schema.Component {
  collectionName: 'components_config_review_value_lists';
  info: {
    displayName: 'Possible Value';
    description: '';
  };
  attributes: {
    value: Attribute.String;
  };
}

export interface ConfigReviewPossibleTriggerValues extends Schema.Component {
  collectionName: 'components_config_review_possible_trigger_values';
  info: {
    displayName: 'Possible Trigger Values';
    description: '';
  };
  attributes: {
    widget_min_deposit_withdrawal_label: Attribute.String;
    widget_min_deposit_withdrawal_values: Attribute.Component<
      'config-review.value-list',
      true
    >;
    widget_trading_volume_label: Attribute.String;
    widget_trading_volume_values: Attribute.Component<
      'config-review.value-list',
      true
    >;
    widget_verification_label: Attribute.String;
    widget_verification_values: Attribute.Component<
      'config-review.value-list',
      true
    >;
    widget_spot_commission_label: Attribute.String;
    widget_spot_commission_values: Attribute.Component<
      'config-review.value-list',
      true
    >;
    widget_futures_commission_label: Attribute.String;
    widget_futures_commission_values: Attribute.Component<
      'config-review.value-list',
      true
    >;
  };
}

export interface ConfigReviewPossibleLinkValue extends Schema.Component {
  collectionName: 'components_config_review_possible_link_values';
  info: {
    displayName: 'Possible Link Value';
  };
  attributes: {
    value: Attribute.String;
    link: Attribute.String;
  };
}

export interface ConfigReviewPossibleInfo extends Schema.Component {
  collectionName: 'components_config_review_possible_infos';
  info: {
    displayName: 'Possible Company Info';
    description: '';
  };
  attributes: {
    label: Attribute.String;
    values: Attribute.Component<'config-review.possible-link-value', true>;
  };
}

export interface BottomToolbarLinkWithIcon extends Schema.Component {
  collectionName: 'components_bottom_toolbar_link_with_icons';
  info: {
    displayName: 'Link With Icon';
    description: '';
  };
  attributes: {
    icon: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    label: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'sidebar.quiz': SidebarQuiz;
      'sidebar.quiz-option': SidebarQuizOption;
      'sidebar.current-reviews': SidebarCurrentReviews;
      'sidebar.current-post': SidebarCurrentPost;
      'review.trigger-widget': ReviewTriggerWidget;
      'review.trigger-value': ReviewTriggerValue;
      'review.summary-rating': ReviewSummaryRating;
      'review.review-options': ReviewReviewOptions;
      'review.pros-cons': ReviewProsCons;
      'review.content-menu': ReviewContentMenu;
      'review.company-info': ReviewCompanyInfo;
      'shared.rating-label': SharedRatingLabel;
      'shared.meta': SharedMeta;
      'shared.label': SharedLabel;
      'shared.image': SharedImage;
      'homepage.desk-card': HomepageDeskCard;
      'config-review.value-list': ConfigReviewValueList;
      'config-review.possible-trigger-values': ConfigReviewPossibleTriggerValues;
      'config-review.possible-link-value': ConfigReviewPossibleLinkValue;
      'config-review.possible-info': ConfigReviewPossibleInfo;
      'bottom-toolbar.link-with-icon': BottomToolbarLinkWithIcon;
    }
  }
}
