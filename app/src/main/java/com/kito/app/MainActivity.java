package com.kito.app;
import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.os.Handler;
import android.os.Looper;
public class MainActivity extends androidx.appcompat.app.AppCompatActivity {
 private WebView appView;
 @Override protected void onCreate(android.os.Bundle savedInstanceState){
  super.onCreate(savedInstanceState);appView=new WebView(this);setContentView(appView);
  android.webkit.WebSettings settings=appView.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(true);
  appView.addJavascriptInterface(new DumaPrinter(this),"DumaPrinter");appView.setWebViewClient(new WebViewClient());appView.loadUrl("file:///android_asset/index.html");
 }
 private static class DumaPrinter {
  private final MainActivity activity;DumaPrinter(MainActivity activity){this.activity=activity;}
  @JavascriptInterface public void print(String html,String title){
   if(html==null||html.length()>2000000)return;
   new Handler(Looper.getMainLooper()).post(()->{
    WebView printView=new WebView(activity);printView.getSettings().setJavaScriptEnabled(false);
    printView.setWebViewClient(new WebViewClient(){
     @Override public void onPageFinished(WebView view,String url){
      PrintManager manager=(PrintManager)activity.getSystemService(Context.PRINT_SERVICE);
      String jobName=(title==null||title.trim().isEmpty())?"DUMA document":title;
      manager.print(jobName,view.createPrintDocumentAdapter(jobName),new PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).setResolution(new PrintAttributes.Resolution("pdf","PDF",300,300)).setMinMargins(PrintAttributes.Margins.NO_MARGINS).build());
     }
    });printView.loadDataWithBaseURL(null,html,"text/HTML","UTF-8",null);
   });
  }
 }
}