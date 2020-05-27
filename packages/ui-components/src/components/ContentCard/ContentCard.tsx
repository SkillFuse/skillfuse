/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import moment from 'moment';
import { cx } from 'emotion';
import Button from '../Button';
import Avatar from '../Avatar';

import { headerContainerStyle } from './styles';

interface CardProps {
  className: string;
  thumbnail: string;
  category: string;
  title: string;
  userName: string;
  userAvatar: string;
  createdAt?: Date;
  description?: string;
  callToActionButton?: React.ReactNode;
  topBar?: React.ReactNode;
  infoBar?: React.ReactNode;
  onClick: () => void;
}

const ContentCard: React.FC<CardProps> = (props: CardProps) => {
  return (
    <div className={cx('flex flex-col shadow-md rounded-md overflow-hidden', props.className)}>
      <div className={headerContainerStyle}>
        <img
          className="object-cover cursor-pointer bg-grey-light w-full"
          src={props.thumbnail}
          style={{ height: '13rem' }}
          onClick={props.onClick}
        />
        {props.topBar}
      </div>
      <div className="flex flex-col items-stretch flex-grow py-2 px-4">
        <Button className="self-start" variant="link">
          {props.category}
        </Button>
        <p className="leading-tight text-xl font-semibold hover:underline cursor-pointer" onClick={props.onClick}>
          {props.title}
        </p>
        <p className="leading-tight mt-2 text-grey-dark">{props.description}</p>
        {props.infoBar}
        <div className="flex flex-row mt-2 mb-2 items-end flex-grow">
          <div className="flex items-center flex-grow">
            <Avatar URL={props.userAvatar} alt="Profile Picture" size="small" />
            <div className="flex-col flex-auto">
              <p className="ml-2 leading-tight text-grey-dark">{props.userName}</p>
              {props.createdAt && <p className="ml-2 text-xs text-grey-dark">{moment(props.createdAt).format('LL')}</p>}
            </div>
          </div>
          {props.callToActionButton}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
