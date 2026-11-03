import '../../security';

import { observer } from 'mobx-react-lite';
import { Card, Tabs, Input, Button, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next'; // 💡 引入 react-i18next 的渲染钩子
import { safeInternalPath, useViewModel } from '@app';
import { SecurityViewModel } from './security_view_model';
import { AuthEnum } from '../../domain/enum/auth_enum';

import './security.scss';

export default observer(function SecurityView() {
  const vm = useViewModel<SecurityViewModel>(SecurityViewModel);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation(); // 💡 消费全局注册的多语言包

  const tabItems = [
    { key: AuthEnum.LOGIN, label: t('security.login_tab') },
    { key: AuthEnum.REGISTER, label: t('security.register_tab') },
  ];

  return (
    <div className="auth-wrapper">
      <Card className="auth-card" title={t('security.title')}>
        {vm.errorMessage && (
          <Alert className="error-alert" title={vm.errorMessage} type="error" showIcon closable />
        )}

        <Tabs
          activeKey={vm.activeTab}
          items={tabItems}
          onChange={(key) => vm.switchTab(key as AuthEnum)}
        />

        {vm.activeTab === AuthEnum.LOGIN && (
          <Space orientation="vertical" style={{ width: '100%' }} size="middle">
            <Input
              prefix={<UserOutlined />}
              placeholder={t('security.username_placeholder')}
              value={vm.loginForm.username}
              // onChange={(e) => vm.loginForm.username = e.target.value}
              onChange={(e) => vm.loginForm.setUsername(e.target.value)}
            />
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('security.password_placeholder')}
              value={vm.loginForm.password}
              onChange={(e) => vm.loginForm.setPassword(e.target.value)}
            />
          </Space>
        )}

        {vm.activeTab === AuthEnum.REGISTER && (
          <Space orientation="vertical" style={{ width: '100%' }} size="middle">
            <Input
              prefix={<UserOutlined />}
              placeholder={t('security.username_placeholder')}
              value={vm.registerForm.username}
              // onChange={(e) => vm.registerForm.username = e.target.value}
              onChange={(e) => vm.registerForm.setUsername(e.target.value)}
            />
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('security.password_placeholder')}
              value={vm.registerForm.password}
              onChange={(e) => vm.registerForm.setPassword(e.target.value)}
            />
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('security.confirm_password_placeholder')}
              value={vm.registerForm.confirmPassword}
              onChange={(e) => vm.registerForm.setConfirmPassword(e.target.value)}
            />
          </Space>
        )}

        <Button
          type="primary"
          className="submit-btn"
          loading={vm.isLoading}
          onClick={async () => {
            const loggedIn = await vm.submit();
            if (!loggedIn) return;
            navigate(safeInternalPath(searchParams.get('from')) ?? '/', { replace: true });
          }}
        >
          {vm.activeTab === AuthEnum.LOGIN ? t('security.btn_login') : t('security.btn_register')}
        </Button>
      </Card>
    </div>
  );
});
