import React, { useState, useEffect } from 'react';
import {
  Popover, Slider, Switch, Radio, Space, Form, Upload, message, Button,
} from 'antd';
import { SketchPicker } from 'react-color';
import styled from '@emotion/styled';
import { useFnDebounce } from 'utils';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import http from 'utils/http';

interface posterDataType {
  headerData?: {
    show: boolean;
    left: number;
    top: number;
    circle: number;
  },
  nicknameData?: {
    show: boolean;
    left: number;
    top: number;
    fontSize: number;
    fontColor: string;
  },
  qrData?: {
    left: number;
    top: number;
  }
}

interface CustomPosterProp {
  getPosterData: (arg0: posterDataType) => void;
  posterData?: posterDataType;
}

const CustomPoster = (prop: CustomPosterProp) => {
  const { getPosterData, posterData } = prop;
  const [dragStart, setDragStart] = useState(false);
  const [form] = Form.useForm();

  const [clientX, setClientX] = useState(0);
  const [clientY, setClientY] = useState(0);

  const [offsetLeft, setOffsetLeft] = useState(0);
  const [offsetTop, setOffsetTop] = useState(0);

  const [headerData, setHeaderData] = useState({
    show: true,
    left: 15,
    top: 15,
    circle: 0,
  });
  const [nicknameData, setNicknameData] = useState({
    show: true,
    left: 50,
    top: 20,
    fontSize: 14,
    fontColor: 'rgba(255,255,255,1)',
  });
  const [qrData, setQrData] = useState({ left: 226, top: 476 });
  const [currentMoveId, setCurrentMoveId] = useState('header');
  const [currentEleHeight, setCurrentEleHeight] = useState(0);
  const [currentEleWidth, setCurrentEleWidth] = useState(0);
  const [posterBg, setPosterBg] = useState('https://oss.juzhunshuyu.com/scrm/marketing/active/social/d5915bfda1864ca1a84af8eb8c28923b.png');

  const handleMouseDown = (e: any) => {
    e.preventDefault();
    const moveHtml = e.target;
    setCurrentMoveId(moveHtml.id);
    setDragStart(true);
    setClientX(e.clientX);
    setClientY(e.clientY);
    if (moveHtml) {
      setOffsetLeft(moveHtml.offsetLeft);
      setOffsetTop(moveHtml.offsetTop);
      setCurrentEleHeight(moveHtml.offsetHeight);
      setCurrentEleWidth(moveHtml.offsetWidth);
    }
  };

  const handleMouseMove = useFnDebounce((e: React.MouseEvent) => {
    e.preventDefault();
    if (!dragStart) return;
    const nx = e.clientX;
    const ny = e.clientY;
    const l = nx - (clientX - offsetLeft);
    const t = ny - (clientY - offsetTop);
    let left = 0;
    let top = 0;
    const maxLeft = 315 - currentEleWidth;
    const maxTop = 560 - currentEleHeight;
    // 边界判断
    if (l > 0) {
      left = l > maxLeft ? maxLeft : l;
    } else {
      left = 0;
    }
    if (t > 0) {
      top = t > maxTop ? maxTop : t;
    } else {
      top = 0;
    }
    if (currentMoveId === 'header') {
      setHeaderData({
        ...headerData,
        left,
        top,
      });
    } else if (currentMoveId === 'nick') {
      setNicknameData({
        ...nicknameData,
        left,
        top,
      });
    } else if (currentMoveId === 'qrcode') {
      setQrData({
        left,
        top,
      });
    }
  }, 5);

  const beforeUpload = (file: { type: string; size: number; }) => {
    const isJpgOrPng = ['image/jpeg', 'image/png'].includes(file.type);
    if (!isJpgOrPng) {
      message.error('上传图片格式只能是jpg和png');
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      message.error('图片大小不能超过5MB');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange = (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status === 'done' && info.file.response.success) {
      setPosterBg(info.file.response.data);
      message.success('上传成功');
    }
  };

  const changeColor = (selectedColor:any) => {
    const {
      r, g, b, a,
    } = selectedColor.rgb;
    setNicknameData({
      ...nicknameData,
      fontColor: `rgba(${r},${g},${b},${a})`,
    });
  };

  useEffect(() => {
    getPosterData({ nicknameData, headerData, qrData });
    document.onmousemove = (e) => {
      handleMouseMove(e);
    };
    document.onmouseup = (e) => {
      e.preventDefault();
      setDragStart(false);
    };
  }, [nicknameData, headerData, qrData]);

  useEffect(() => {
    if (posterData?.headerData) {
      setHeaderData(posterData.headerData);
    }
    if (posterData?.nicknameData) {
      setNicknameData(posterData.nicknameData);
    }
    if (posterData?.qrData) {
      setQrData(posterData.qrData);
    }
  }, []);

  return (
    <PosterWarp>
      <Form form={form}>
        <Form.Item label="活动主图" required>
          <Space size={15} align="end">
            <img className="poster-bg" src={posterBg} alt="" />
            <div>
              <Upload
                name="file"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleChange}
                action={`${http.baseURL}/scrm/social/upload-activity-img`}
              >
                <Button type="link">修改</Button>
              </Upload>
              <div style={{ fontSize: '1.2rem', color: 'rgba(0,0,0,.25)' }}>
                建议尺寸750*1334px，JPG、PNG格式，图片小于2MB
              </div>
            </div>
          </Space>
        </Form.Item>
        <Form.Item label="邀请头像">
          <Space size={40}>
            <Switch
              checked={headerData.show}
              onChange={(show) => setHeaderData({ ...headerData, show })}
            />
            {
              headerData.show && (
                <Radio.Group
                  value={headerData.circle}
                  onChange={(e) => setHeaderData({ ...headerData, circle: e.target.value })}
                >
                  <Radio value={0}>圆形</Radio>
                  <Radio value={1}>方形</Radio>
                </Radio.Group>
              )
            }
          </Space>
        </Form.Item>
        <Form.Item label="邀请昵称">
          <Space size={40}>
            <Switch
              checked={nicknameData.show}
              onChange={(show) => setNicknameData({ ...nicknameData, show })}
            />
            {
              nicknameData.show && (
                <Space>
                  <div className="color-warp">
                    <Popover
                      getPopupContainer={
                        (triggerNode) => triggerNode.parentElement || document.body
                      }
                      overlayClassName="color-popover"
                      content={(
                        <SketchPicker
                          color={nicknameData.fontColor}
                          onChange={(selectColor) => changeColor(selectColor)}
                        />
                      )}
                      trigger="click"
                    >
                      <span className="color-block" style={{ background: nicknameData.fontColor }} />
                    </Popover>
                  </div>
                  <div style={{ width: 260 }}>
                    <Slider
                      min={12}
                      max={36}
                      onChange={(value) => setNicknameData({ ...nicknameData, fontSize: value })}
                      value={nicknameData.fontSize}
                    />
                  </div>
                </Space>
              )
            }
          </Space>
        </Form.Item>
        <div className="poster-text">
          <p>邀请海报设计须知:</p>
          <p>1. [用户头像] [用户昵称] [带参二维码]这三个元素需要空出</p>
          <p>2.海报其他部分皆可自定义设计</p>
          <p>3.可自行拖拉设置相应元素</p>
        </div>
      </Form>
      <Poster id="poster" style={{ background: `url(${posterBg})` }}>
        {
          headerData.show && (
            <div
              id="header"
              style={{
                left: `${headerData.left}px`,
                top: `${headerData.top}px`,
                borderRadius: `${headerData.circle ? '0' : '50%'}`,
              }}
              className="font_family icon-touxiang1 head-portrait"
              onMouseDown={handleMouseDown}
            />
          )
        }
        {
          nicknameData.show && (
            <div
              id="nick"
              style={{
                fontSize: nicknameData.fontSize,
                color: nicknameData.fontColor,
                left: `${nicknameData.left}px`,
                top: `${nicknameData.top}px`,
              }}
              onMouseDown={handleMouseDown}
              className="nick"
            >用户名称
            </div>
          )
        }
        <div
          style={{ left: `${qrData.left}px`, top: `${qrData.top}px` }}
          id="qrcode"
          className="font_family icon-erweima qrcode"
          onMouseDown={handleMouseDown}
        />
      </Poster>
    </PosterWarp>
  );
};

export default CustomPoster;

const PosterWarp = styled.div`
  display: flex;
  width: 100%;
  .poster-bg {
    width: 8.7rem;
    height: 9rem;
  }
  .poster-text {
    margin-left: 5rem;
    font-size: 1.2rem;
    line-height: 1;
    color: rgba(0,0,0,0.45);
  }
  .ant-form {
    width: 800px;
  }
  .ant-form-item-label {
    width: 12rem;
    text-align: right;
  }
  .ant-popover-inner-content {
    padding: 0;
  }
  .color-warp {
    display: inline-block;
    width: 4rem;
    height: 2rem;
    margin-top: 1rem;
    .color-block {
      display: inline-block;
      border: 1px solid rgba(0, 0, 0, 0.25);
      height: 2rem;
      width: 4rem;
      cursor: pointer;
    }
  }
`;
const Poster = styled.div`
  width: 315px;
  height: 560px;
  border: 1px solid #ddd;
  position: relative;
  .head-portrait {
    cursor: pointer;
    width: 30px;
    height: 30px;
    position: absolute;
    color: #fff;
    border: 1px dashed #fff;
    background: rgba(255,255,255,.3);
    text-align: center;
    font-size: 1.8rem;
  }
  .nick {
    position: absolute;
    white-space: nowrap;
    font-size: 1.5rem;
    background: rgba(255,255,255,.3);
    padding: 0 .2rem;
    border: 1px dashed #fff;
    cursor: pointer;
  }
  .qrcode {
    position: absolute;
    font-size: 5rem;
    cursor: pointer;
    color: #fff;
    width: 64px;
    height: 64px;
    background: rgba(255,255,255,.3);
    text-align: center;
    line-height: 64px;
    border: 1px dashed #fff;
  }
`;
