import * as React from 'react';
import classNames from 'classnames';
import ReactIcon from '@ant-design/icons-react';
import createFromIconfontCN from './IconFont';
import { svgBaseProps, withThemeSuffix, removeTypeTheme, getThemeFromTypeName } from './utils';
import warning from '../_util/warning';
import { getTwoToneColor, setTwoToneColor } from './twoTonePrimaryColor';
import version from '../version';

// Initial setting
setTwoToneColor('#1890ff');
let defaultTheme: ThemeType = 'outlined';
let dangerousTheme: ThemeType | undefined = undefined;

export interface CustomIconComponentProps {
  width: string | number;
  height: string | number;
  fill: string;
  viewBox?: string;
  className?: string;
  style?: React.CSSProperties;
  ['aria-hidden']?: string;
}

export type ThemeType = 'filled' | 'outlined' | 'twoTone';

export interface IconProps {
  type?: string;
  className?: string;
  theme?: ThemeType;
  title?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  component?: React.ComponentType<CustomIconComponentProps>;
  twoToneColor?: string;
  viewBox?: string;
  spin?: boolean;
  style?: React.CSSProperties;
  prefixCls?: string;
}

const SVG_SPRITES_URL = 'https://gw.alipayobjects.com/os/rmsportal/EOMjVGojMtpkzPJtrvCN.txt';
const CACHE_KEY = `antd-icons-${version}`;
let svgLoading = false;
let svgAppended = false;

const appendSvg = (svgSprite: string) => {
  const div = document.createElement('div');
  div.innerHTML = svgSprite;
  const svg = div.getElementsByTagName('svg')[0];
  if (svg) {
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.overflow = 'hidden';
    document.body.appendChild(svg);
  }
};

const request = (url: string, cb: (res: string) => void) => {
  const cache = window.localStorage.getItem(CACHE_KEY);
  if (cache) {
    cb(cache);
  } else {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        window.localStorage.setItem(CACHE_KEY, xhr.response);
        cb(xhr.response);
      }
    });
    xhr.send();
  }
};

class Icon extends React.Component<IconProps> {
  static createFromIconfontCN = createFromIconfontCN;
  static getTwoToneColor = getTwoToneColor;
  static setTwoToneColor = setTwoToneColor;
  static unstable_ChangeThemeOfIconsDangerously = unstable_ChangeThemeOfIconsDangerously;
  static unstable_ChangeDefaultThemeOfIcons = unstable_ChangeDefaultThemeOfIcons;

  componentDidMount() {
    const type = this.computedType();
    if (!ReactIcon.get(type) && !svgAppended && !svgLoading) {
      svgLoading = true;
      request(SVG_SPRITES_URL, (res) => {
        appendSvg(res);
        svgAppended = true;
        svgLoading = false;
      });
    }
  }

  computedType() {
    const { type, theme } = this.props;
    if (!type) {
      return '';
    }
    return withThemeSuffix(removeTypeTheme(type), dangerousTheme || theme || defaultTheme);
  }

  render() {
    const {
      // affect outter <i>...</i>
      className,

      // affect inner <svg>...</svg>
      type,
      component: Component,
      viewBox,
      spin,

      // children
      children,

      // other
      theme, // default to outlined
      twoToneColor,

      ...restProps
    } = this.props;

    warning(Boolean(type || Component || children), 'Icon should have `type` prop or `component` prop or `children`.');

    const classString = classNames(
      {
        [`anticon`]: true,
        [`anticon-${type}`]: Boolean(type),
      },
      className,
    );

    const svgClassString = classNames({
      [`anticon-spin`]: !!spin || type === 'loading',
    });

    let innerNode;

    // component > children > type
    if (Component) {
      const innerSvgProps: CustomIconComponentProps = {
        ...svgBaseProps,
        className: svgClassString,
        viewBox,
      };
      if (!viewBox) {
        delete innerSvgProps.viewBox;
      }

      innerNode = <Component {...innerSvgProps}>{children}</Component>;
    }

    if (children) {
      warning(
        Boolean(viewBox) ||
          (React.Children.count(children) === 1 &&
            React.isValidElement(children) &&
            React.Children.only(children).type === 'use'),
        'Make sure that you provide correct `viewBox`' + ' prop (default `0 0 1024 1024`) to the icon.',
      );
      const innerSvgProps: CustomIconComponentProps = {
        ...svgBaseProps,
        className: svgClassString,
      };
      innerNode = (
        <svg {...innerSvgProps} viewBox={viewBox}>
          {children}
        </svg>
      );
    }

    if (typeof type === 'string') {
      if (theme) {
        const themeInName = getThemeFromTypeName(type);
        warning(
          !themeInName || theme === themeInName,
          `The icon name '${type}' already specify a theme '${themeInName}',` +
            ` the 'theme' prop '${theme}' will be ignored.`,
        );
      }
      const computedType = this.computedType();
      if (ReactIcon.get(computedType)) {
        innerNode = <ReactIcon className={svgClassString} type={computedType} primaryColor={twoToneColor} />;
      } else {
        const innerSvgProps: CustomIconComponentProps = {
          ...svgBaseProps,
          className: svgClassString,
        };
        innerNode = (
          <svg {...innerSvgProps} viewBox={viewBox}>
            <use xlinkHref={`#${type}`} />
          </svg>
        );
      }
    }

    return (
      <i {...restProps} className={classString}>
        {innerNode}
      </i>
    );
  }
}

function unstable_ChangeThemeOfIconsDangerously(theme?: ThemeType) {
  warning(
    false,
    `You are using the unstable method 'Icon.unstable_ChangeThemeOfAllIconsDangerously', ` +
      `make sure that all the icons with theme '${theme}' display correctly.`,
  );
  dangerousTheme = theme;
}

function unstable_ChangeDefaultThemeOfIcons(theme: ThemeType) {
  warning(
    false,
    `You are using the unstable method 'Icon.unstable_ChangeDefaultThemeOfIcons', ` +
      `make sure that all the icons with theme '${theme}' display correctly.`,
  );
  defaultTheme = theme;
}

export default Icon;
