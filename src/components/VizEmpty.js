// @flow
import React, { Component } from 'react'
import classes from './VizEmpty.module.css'

const svg = (
  <svg
    width={180}
    height={180}
    viewBox="0 0 180 180"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter
        x="-15.4%"
        y="-16.2%"
        width="135.8%"
        height="137.7%"
        filterUnits="objectBoundingBox"
        id="vizEmptySvgFilter"
      >
        <feOffset dx={2} dy={2} in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur
          stdDeviation="4.5"
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
        />
        <feComposite
          in="shadowBlurOuter1"
          in2="SourceAlpha"
          operator="out"
          result="shadowBlurOuter1"
        />
        <feColorMatrix
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          in="shadowBlurOuter1"
          result="shadowMatrixOuter1"
        />
        <feMerge>
          <feMergeNode in="shadowMatrixOuter1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g fill="none" fillRule="evenodd">
      <rect
        fillOpacity=".8"
        fill="#70BCF5"
        opacity=".5"
        width={180}
        height={180}
        rx={90}
      />
      <g filter="url(#vizEmptySvgFilter)" transform="translate(50 52)">
        <path
          d="M44.17 0h-7.34C35.82 0 35 .82 35 1.83v7.34c0 1 .82 1.83 1.83 1.83h7.34c1.01 0 1.83-.82 1.83-1.83V1.83c0-1-.82-1.83-1.83-1.83z"
          fill="#898989"
        />
        <path
          d="M72.24 7H8.76C7.8 7 7 7.8 7 8.77v49.46a1.76 1.76 0 1 0 3.53 0h59.94a1.76 1.76 0 1 0 3.53 0V8.77C74 7.79 73.21 7 72.24 7z"
          fill="#F7F7F7"
        />
        <path
          d="M41 74c-1.1 0-2-.8-2-1.8V57.8c0-1 .9-1.8 2-1.8s2 .8 2 1.8v14.4c0 1-.9 1.8-2 1.8zm-21.2 3c-.4 0-.8-.13-1.12-.38-.78-.6-.9-1.7-.29-2.46l14.4-17.5a1.84 1.84 0 0 1 2.53-.28c.78.6.9 1.7.29 2.46l-14.4 17.5a1.8 1.8 0 0 1-1.41.66zm42.4 0c-.53 0-1.05-.22-1.4-.66l-14.4-17.5a1.7 1.7 0 0 1 .28-2.46c.77-.6 1.9-.48 2.53.28l14.4 17.5c.62.75.49 1.85-.29 2.46-.33.25-.72.38-1.12.38z"
          fill="#898989"
        />
        <path
          d="M79.24 60H1.76C.8 60 0 59.1 0 58s.79-2 1.76-2h77.48c.97 0 1.76.9 1.76 2s-.79 2-1.76 2z"
          fill="#323D48"
        />
        <path
          d="M42.25 18h-3.5c-.97 0-1.75.78-1.75 1.75v24.5c0 .97.78 1.75 1.75 1.75h3.5c.97 0 1.75-.78 1.75-1.75v-24.5c0-.97-.78-1.75-1.75-1.75zm-14 13h-3.5c-.97 0-1.75.78-1.75 1.75v10.5c0 .97.78 1.75 1.75 1.75h3.5c.97 0 1.75-.78 1.75-1.75v-10.5c0-.97-.78-1.75-1.75-1.75zm28-3h-3.5c-.97 0-1.75.8-1.75 1.8v14.4c0 1 .78 1.8 1.75 1.8h3.5c.97 0 1.75-.8 1.75-1.8V29.8c0-1-.78-1.8-1.75-1.8z"
          fill="#43A6DD"
        />
      </g>
    </g>
  </svg>
)

export default class VizEmpty extends Component<{}> {
  render() {
    return (
      <div className={classes.container}>
        {svg}
        <div className={classes.text}>
          Choose a chart type and columns <br />to the left and your chart will
          appear.<br />Like magic ✨
        </div>
      </div>
    )
  }
}
