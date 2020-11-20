/*
 * @Author: greatpie
 * @Date: 2020-11-21 02:50:58
 * @LastEditTime: 2020-11-21 03:11:47
 * @LastEditors: greatpie
 * @FilePath: /OMO_GIS/index.js
 */
import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
