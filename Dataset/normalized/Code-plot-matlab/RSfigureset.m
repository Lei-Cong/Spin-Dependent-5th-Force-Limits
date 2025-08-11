%   xmin=-4
%   xmax=4
%   ymin=-1.5
%   ymax=2
%   axis([xmin,xmax,ymin,ymax]);
 set (gcf,'windowstyle','normal');
 %set(gcf,'Position',[100,262,580,400]); 
 set(gcf,'Position',[100,262,400,380]); 
 %fig3 500,540
 %fig4 550,400
 
 %fig2 480,380
 %fig5 580 400
 %fig compare QRM   580,400
labelsize=14;
set(get(gca,'XLabel'),'FontSize',labelsize,'FontName','Serif','FontWeight','bold')
set(get(gca,'YLabel'),'FontSize',labelsize,'FontName','Serif','FontWeight','bold')
set(get(gca,'Title'),'FontSize',labelsize,'FontName','Serif','FontWeight','bold')
%legend('our variational 2 polaorn','ed','potential minima','Liwei Duan variational')
%legend('ed','Liwei Duan variational','our variational 2 polaorn')
%LA=axis
%text(-(LA(2)-LA(1))*0.15+LA(1),(LA(4)-LA(3))*0.9+LA(3),'(a)','FontSize',15,'FontName','Serif');
labelnumbersize=12;
set(gca,'FontName','Serif','FontSize',labelnumbersize,'FontWeight','bold')
set(findall(gcf,'type','line'),'linewidth',3)
set(gca, 'LineWidth',1.5)  %bian kuang cu zi
%box on;

%get figure data
%{
% get data from .fig figure
%
lh=findall(gca,'type','line'); % �ӵ�ǰͼ(gca)��ȡ�����ߵ�handle,
xc=get(lh,'xdata'); % ȡ��x����ݣ�ע�⣬���x��y����cell����ݽṹ�����
yc=get(lh,'ydata'); % ȡ��y�����??
x=xc{1};
y=yc{1};

x1=xc{4};
y1=yc{4};

figure(55)
plot(x,y,'-o',x1,y1,'-s')
hold on
plot(x(1:2:201),y(1:2:201),'-o')
%}

%set figure size
%set(gcf,'unit','centimeters','position',[10 5 7 5])
%figure; subplot(2,2,1); set(gca,'position',)